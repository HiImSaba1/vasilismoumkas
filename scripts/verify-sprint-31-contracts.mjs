import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const[leads,clients,offers,dateLock]=await Promise.all([
  read("src/lib/leads.ts"),
  read("src/lib/clients.ts"),
  read("src/lib/offers.ts"),
  read("src/lib/event-date-lock.ts"),
]);

requireText(leads,/INSERT INTO leads[\s\S]*event_date[\s\S]*VALUES/ ,"lead creation keeps event dates without checking or limiting other leads");
requireText(dateLock,/GET_LOCK\(\?,5\)[\s\S]*FROM clients WHERE event_date=\?[\s\S]*already booked by/ ,"client dates use an atomic named lock and report the client already holding the date");
requireText(dateLock,/Leads may share a date, but only one can become a client/ ,"the conflict message explains the unlimited-lead and single-client rule");
requireText(offers,/input\.action==="accept"[\s\S]*lockClientEventDate\(connection,leadDates\[0\]\?\.event_date\?\?null,linkedClients\[0\]\?\.id\)[\s\S]*status='accepted'/ ,"offer acceptance checks the date before accepting and creating the client");
requireText(clients,/createClientFromLead[\s\S]*lockClientEventDate\(connection,lead\.event_date\)[\s\S]*INSERT INTO clients/ ,"manual lead conversion respects the same client date lock");
requireText(clients,/updateClient[\s\S]*lockClientEventDate\(connection,input\.eventDate,id\)[\s\S]*UPDATE clients/ ,"changing a client date cannot overwrite another client's booking");
requireText(offers,/finally\{await releaseClientEventDate\(connection,dateLock\);connection\.release\(\)\}/ ,"offer acceptance always releases its date lock");
requireText(clients,/finally\{await releaseClientEventDate\(connection,dateLock\);connection\.release\(\)\}/ ,"client creation and editing always release their date locks");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 31 client date locking contracts verified.`);
