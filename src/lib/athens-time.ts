const LOCAL_DATE_TIME=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

const athensParts=(date:Date)=>Object.fromEntries(
  new Intl.DateTimeFormat("en-CA",{
    timeZone:"Europe/Athens",year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23",
  }).formatToParts(date).filter(part=>part.type!=="literal").map(part=>[part.type,part.value]),
);

/** Convert an HTML datetime-local value in Europe/Athens to a UTC MySQL timestamp. */
export function athensLocalToUtcSql(value:string){
  const match=LOCAL_DATE_TIME.exec(value);
  if(!match)return null;
  const[,year,month,day,hour,minute]=match;
  const desiredUtc=Date.UTC(Number(year),Number(month)-1,Number(day),Number(hour),Number(minute));
  let candidate=new Date(desiredUtc);
  for(let pass=0;pass<2;pass++){
    const parts=athensParts(candidate);
    const represented=Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day),Number(parts.hour),Number(parts.minute),Number(parts.second));
    candidate=new Date(candidate.getTime()+(desiredUtc-represented));
  }
  const confirmed=athensParts(candidate);
  if(confirmed.year!==year||confirmed.month!==month||confirmed.day!==day||confirmed.hour!==hour||confirmed.minute!==minute)return null;
  return candidate.toISOString().slice(0,19).replace("T"," ");
}
