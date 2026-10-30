& {
    $ErrorActionPreference = 'Stop'
    Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
    $remoteScript = @'
set -eu
set -o pipefail
active='/var/www/vhosts/sabaweb.gr/vasilismoumkas.com/releases/github-16-20261016-sprint47'
test "$(cat "$active/.next/standalone/.next/BUILD_ID")" = 'sckGRKfinaFDEseSgVk6y'
cd "$active"
/opt/plesk/node/22/bin/node <<'NODE'
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const root=process.cwd();
process.loadEnvFile(path.join(root,'.env.production.local'));
const leadId='54cc8a5a-25cf-4a47-8455-e83ca6a07354';
(async()=>{
 try{
  const client=['/usr/bin/mariadb','/usr/bin/mysql','mariadb','mysql'].find(binary=>{const result=spawnSync(binary,['--no-defaults','--version'],{stdio:'ignore',timeout:5000});return !result.error&&result.status===0;});
  if(!client)throw Object.assign(new Error('Client unavailable'),{code:'MYSQL_CLI_NOT_FOUND'});
  for(const key of ['DB_HOST','DB_NAME','DB_USER','DB_PASSWORD'])if(process.env[key]===undefined)throw Object.assign(new Error('Configuration unavailable'),{code:'DATABASE_CONFIGURATION_MISSING'});
  if(!/^\d+$/.test(process.env.DB_PORT??'3306'))throw Object.assign(new Error('Invalid port'),{code:'INVALID_CONFIGURED_DATABASE_PORT'});
  const statements=['START TRANSACTION READ ONLY'];
  for(const [label,sql,params] of [
   ['LEAD PROFILE',"SELECT event_type,workflow_locale,status,DATE_FORMAT(event_date,'%Y-%m-%d') event_date FROM leads WHERE id=?",[leadId]],
   ['LINKED OFFERS',"SELECT event_type,language,status,COUNT(*) records FROM offers WHERE lead_id=? GROUP BY event_type,language,status",[leadId]],
   ['CLIENT LINKS',"SELECT COUNT(*) client_records FROM clients WHERE lead_id=?",[leadId]],
   ['DATE COLLISIONS',"SELECT c.event_type,COUNT(*) other_clients FROM clients c JOIN leads l ON l.id=? AND c.event_date=l.event_date WHERE c.lead_id IS NULL OR c.lead_id<>? GROUP BY c.event_type",[leadId,leadId]],
   ['BAPTISM TEMPLATES',"SELECT document_type,locale,is_active,is_default,COUNT(*) records FROM document_templates WHERE event_type='baptism' GROUP BY document_type,locale,is_active,is_default",[]],
   ['EXISTING DOCUMENT STATES',"SELECT document_type,status FROM lead_document_records WHERE lead_id=?",[leadId]],
   ['SQL MODE',"SELECT @@SESSION.sql_mode sql_mode",[]],
   ['CLIENT UNIQUE INDEXES',"SELECT INDEX_NAME,GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) columns_in_index FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='clients' AND NON_UNIQUE=0 GROUP BY INDEX_NAME",[]]
  ]){
   // All bound values are the fixed UUID above; never interpolate user content.
   let index=0;
   const bound=sql.replace(/\?/g,()=>{const value=params[index++];if(value!==leadId||!/^[a-f0-9-]{36}$/.test(value))throw Object.assign(new Error('Invalid binding'),{code:'INVALID_DIAGNOSTIC_BINDING'});return `'${value}'`;});
   statements.push(`SELECT '${label}' AS diagnostic_section`,bound);
  }
  statements.push('ROLLBACK');
  const result=spawnSync(client,['--no-defaults','--batch','--column-names','--connect-timeout=15',`--host=${process.env.DB_HOST}`,`--port=${process.env.DB_PORT??3306}`,`--user=${process.env.DB_USER}`,`--database=${process.env.DB_NAME}`],{input:statements.join(';\n')+';\n',encoding:'utf8',timeout:45000,maxBuffer:1024*1024,env:{...process.env,MYSQL_PWD:process.env.DB_PASSWORD}});
  if(result.error||result.status!==0){const number=result.stderr?.match(/ERROR\s+(\d+)/)?.[1];throw Object.assign(new Error('Read-only query failed'),{code:number?`MYSQL_ERROR_${number}`:'MYSQL_READONLY_QUERY_FAILED'});}
  console.log(result.stdout);
  console.log('=== REDACTED ERROR REFERENCE LOOKUP ===');
  const references=['2774353551','F86D9EB889'];
  for(const log of ['/var/www/vhosts/sabaweb.gr/vasilismoumkas.com/logs/error_log','/var/www/vhosts/sabaweb.gr/logs/error_log']){
   if(!fs.existsSync(log)){console.log(JSON.stringify({log,status:'not-found'}));continue;}
   try{
    const fd=fs.openSync(log,'r');let data;
    try{const size=fs.fstatSync(fd).size;const buffer=Buffer.alloc(Math.min(size,2*1024*1024));fs.readSync(fd,buffer,0,buffer.length,Math.max(0,size-buffer.length));data=buffer.toString('utf8');}finally{fs.closeSync(fd);}
    const lines=data.split('\n');
    for(const reference of references){const index=lines.findIndex(line=>line.includes(reference));const nearby=index<0?'':lines.slice(Math.max(0,index-10),index+15).join('\n');console.log(JSON.stringify({log,reference,foundInLast2MiB:index>=0,errorCodes:[...new Set(nearby.match(/\b(?:ER_[A-Z0-9_]+|SQLSTATE\[[A-Z0-9]+\]|EventDateConflictError)\b/g)??[])],dateConflict:/already booked|only one can become a client/.test(nearby)}));}
   }catch{console.log(JSON.stringify({log,status:'unreadable'}));}
  }
  console.log('PASS - READ-ONLY DIAGNOSTIC COMPLETE; NO CUSTOMER CONTENT, CREDENTIALS OR RAW LOGS DISPLAYED');
 }catch(error){console.error(JSON.stringify({status:'diagnostic-failed',code:typeof error.code==='string'?error.code:'UNKNOWN'}));process.exitCode=1;}
})();
NODE
echo 'NO CRM WRITES, PAYMENT CHANGES, EMAIL, AUTOMATION OR RESTART EXECUTED'
'@
    $remoteScript.Replace("`r", '') | ssh -p 2234 c179367pav@213.158.90.80 "LC_ALL=C sed '1s/^\xEF\xBB\xBF//' | tr -d '\015' | bash -se"
    if ($LASTEXITCODE -ne 0) { throw 'Read-only diagnostic failed. Send its redacted output.' }
}
