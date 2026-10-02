import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir,readFile,rm,unlink,writeFile } from "node:fs/promises";
import path from "node:path";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { resolveClientFilesRoot,resolvePathInsideRoot } from "@/lib/runtime-storage-paths";

const MAX_FILE_BYTES=5*1024*1024;
const allowed=new Map([
  ["application/pdf",".pdf"],
  ["image/jpeg",".jpg"],
  ["image/png",".png"],
  ["image/webp",".webp"],
]);
const storageRoot=()=>resolveClientFilesRoot();
const safeName=(value:string)=>path.basename(value).normalize("NFKC").replace(/[<>:"/\\|?*\u0000-\u001f]/g,"-").replace(/\s+/g," ").trim().slice(0,240)||"receipt";
const signatureMatches=(buffer:Buffer,mime:string)=>mime==="application/pdf"?buffer.subarray(0,5).toString()==="%PDF-":mime==="image/jpeg"?buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff:mime==="image/png"?buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):mime==="image/webp"?buffer.subarray(0,4).toString()==="RIFF"&&buffer.subarray(8,12).toString()==="WEBP":false;

export type ClientFile={id:string;clientId:string;originalName:string;mimeType:string;sizeBytes:number;createdAt:string};
type FileRow=RowDataPacket&{id:string;client_id:string;storage_key:string;original_name:string;mime_type:string;size_bytes:number;created_at:Date};
const map=(row:FileRow):ClientFile=>({id:row.id,clientId:row.client_id,originalName:row.original_name,mimeType:row.mime_type,sizeBytes:Number(row.size_bytes),createdAt:new Date(row.created_at).toISOString()});

export async function listClientFiles(clientId:string){const[rows]=await getDatabase().query<FileRow[]>("SELECT id,client_id,storage_key,original_name,mime_type,size_bytes,created_at FROM documents WHERE client_id=? AND document_type='other' AND status='active' ORDER BY created_at DESC",[clientId]);return rows.map(map)}

export async function storeClientFile(clientId:string,file:File){
  if(!file.size)throw new Error("Choose a receipt file to upload.");
  if(file.size>MAX_FILE_BYTES)throw new Error("The receipt exceeds the 5 MB limit.");
  const extension=allowed.get(file.type);if(!extension)throw new Error("Upload a PDF, JPG, PNG or WebP receipt.");
  const buffer=Buffer.from(await file.arrayBuffer());if(!signatureMatches(buffer,file.type))throw new Error("The file content does not match its declared format.");
  const root=storageRoot();const id=randomUUID();const directory=resolvePathInsideRoot(root,clientId);if(!directory)throw new Error("Invalid client storage path.");await mkdir(directory,{recursive:true});const storageKey=`${clientId}/${id}${extension}`;const target=resolvePathInsideRoot(root,storageKey);if(!target)throw new Error("Invalid stored file path.");await writeFile(target,buffer,{flag:"wx"});
  try{await getDatabase().execute("INSERT INTO documents (id,client_id,document_type,storage_key,original_name,mime_type,size_bytes,status) VALUES (?,?,'other',?,?,?,?,'active')",[id,clientId,storageKey,safeName(file.name),file.type,file.size])}catch(error){await unlink(target).catch(()=>{});throw error}
  await getDatabase().execute("INSERT INTO activity_log (client_id,event_type,summary) VALUES (?,'client-file-uploaded',?)",[clientId,`Private receipt uploaded: ${safeName(file.name)}`]);
  return id;
}

export async function readClientFile(clientId:string,fileId:string){const[rows]=await getDatabase().query<FileRow[]>("SELECT id,client_id,storage_key,original_name,mime_type,size_bytes,created_at FROM documents WHERE id=? AND client_id=? AND document_type='other' AND status='active' LIMIT 1",[fileId,clientId]);const row=rows[0];if(!row)return null;const target=resolvePathInsideRoot(storageRoot(),row.storage_key);if(!target)throw new Error("Invalid stored file path.");return{...map(row),buffer:await readFile(target)}}

export async function removeClientFileStorage(clientIds:string[]){
  const root=storageRoot();
  for(const clientId of [...new Set(clientIds)]){
    const directory=resolvePathInsideRoot(root,clientId);
    if(!directory)throw new Error("Invalid client storage path.");
    await rm(directory,{recursive:true,force:true});
  }
}
