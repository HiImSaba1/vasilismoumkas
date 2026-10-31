"use client";
import {useEffect,useRef,useState} from "react";
import type {EmailDraft} from "@/lib/email-drafts";
import {emailCompositionSchema} from "@/lib/email-composition";
import {loadEmailDraftAction,saveEmailDraftAction,type EmailDraftScope} from "@/app/admin/email-templates/draft-actions";

export function useServerEmailDraft({scope,eventType,draft,carry,completed,restore}:{scope:EmailDraftScope;eventType:string;draft:EmailDraft;carry:boolean;completed:boolean;restore:(draft:EmailDraft)=>void}){
  const[ready,setReady]=useState(false),[status,setStatus]=useState("Loading saved draft…");
  const revision=useRef(0),connected=useRef(false),conflict=useRef(false),dirty=useRef(false);
  const latest=useRef(draft),restoreRef=useRef(restore),queue=useRef(Promise.resolve());
  useEffect(()=>{latest.current=draft;restoreRef.current=restore},[draft,restore]);
  const key=`vm-email-draft-v1:${scope.entityField}:${scope.entityId}:${eventType}:${scope.locale}:${scope.templateId}`;
  useEffect(()=>{
    let current=true;
    loadEmailDraftAction(scope).then(result=>{
      if(!current)return;
      let local:(EmailDraft&{baseRevision?:number})|null=null;
      try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);if(typeof parsed.subject==="string"&&typeof parsed.image==="string")local={subject:parsed.subject,image:parsed.image,content:emailCompositionSchema.parse(parsed.content),baseRevision:parsed.baseRevision}}}catch{/* Local backup can be absent or invalid. */}
      if(result.success){revision.current=result.revision;connected.current=true;
        if(!carry){if(local&&local.baseRevision===result.revision)restoreRef.current(local);else if(result.draft)restoreRef.current(result.draft);else if(result.revision===0&&local)restoreRef.current(local)}
        setStatus("Server draft ready · shared across devices");
      }else{if(local&&!carry)restoreRef.current(local);setStatus(`Server draft unavailable. Local backup only: ${result.message}`)}
      setReady(true);
    }).catch(()=>{if(current){setStatus("Server draft unavailable. Keep this page open.");setReady(true)}});
    return()=>{current=false};
    // Scope is fixed by the keyed composer instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[key,carry]);
  useEffect(()=>{
    if(!ready||completed)return;
    dirty.current=true;
    try{localStorage.setItem(key,JSON.stringify({...draft,baseRevision:revision.current}))}catch{/* Server save still works with disabled storage. */}
    if(!connected.current||conflict.current)return;
    const timer=window.setTimeout(()=>{
      setStatus("Saving server draft…");
      queue.current=queue.current.then(async()=>{
        if(conflict.current)return;
        const result=await saveEmailDraftAction({scope,draft,expectedRevision:revision.current});
        if(result.success){revision.current=result.revision;if(JSON.stringify(latest.current)===JSON.stringify(draft)){dirty.current=false;try{localStorage.setItem(key,JSON.stringify({...draft,baseRevision:result.revision}))}catch{/* Local backup is optional. */}}setStatus(JSON.stringify(latest.current)===JSON.stringify(draft)?"Draft saved on server · available on other devices":"Saving the latest changes…")}
        else{if(result.message.includes("DRAFT_CONFLICT"))conflict.current=true;setStatus(`${result.message} Local text retained.`)}
      }).catch(()=>setStatus("Server save failed. Local text retained; edit again to retry."));
    },800);
    return()=>window.clearTimeout(timer);
  },[ready,completed,key,draft,scope]);
  useEffect(()=>{if(!completed||!ready)return;queue.current=queue.current.then(async()=>{if(connected.current&&!conflict.current){const result=await saveEmailDraftAction({scope,draft:null,expectedRevision:revision.current});if(!result.success){setStatus("Email processed; a newer server draft was retained.");return}revision.current=result.revision}dirty.current=false;try{localStorage.removeItem(key)}catch{/* Storage may be disabled. */}setStatus(connected.current?"Email processed · draft cleared":"Email processed · local draft cleared; server draft unavailable")}).catch(()=>setStatus("Email processed; server draft could not be cleared."))},[completed,ready,key,scope]);
  useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty.current){event.preventDefault();event.returnValue=""}};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn)},[]);
  return{ready,status};
}
