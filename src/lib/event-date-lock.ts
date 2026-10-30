import type { PoolConnection, RowDataPacket } from "mysql2/promise";

const dateKey=(value:Date|string)=>value instanceof Date
  ? `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`
  : value.slice(0,10);

export class EventDateConflictError extends Error {constructor(message:string){super(message);this.name="EventDateConflictError";}}
export type EventDateOverride={confirmed:boolean;reason:string};
export async function lockClientEventDate(connection:PoolConnection,value:Date|string|null,excludeClientId?:string,override?:EventDateOverride){
  if(!value)return null;
  const eventDate=dateKey(value);
  const lockName=`moumkas:client-date:${eventDate}`;
  const[locks]=await connection.query<(RowDataPacket&{acquired:number})[]>("SELECT GET_LOCK(?,5) AS acquired",[lockName]);
  if(Number(locks[0]?.acquired)!==1)throw new Error(`The date ${eventDate} is being confirmed right now. Please try again.`);
  try{
    const[clients]=await connection.query<(RowDataPacket&{id:string;couple_names:string})[]>("SELECT id,couple_names FROM clients WHERE event_date=? AND (? IS NULL OR id<>?) LIMIT 1",[eventDate,excludeClientId??null,excludeClientId??null]);
    if(clients[0]){
      if(!override?.confirmed||override.reason.trim().length<10)throw new EventDateConflictError(`The date ${eventDate} already has a client booking. Review availability, then explicitly confirm the additional booking with a reason. No existing client will be deleted.`);
      // Keep the date lock for the entire transaction even for an explicit override.
    }
    return lockName;
  }catch(error){
    await releaseClientEventDate(connection,lockName);
    throw error;
  }
}

export async function releaseClientEventDate(connection:PoolConnection,lockName:string|null){
  if(lockName)await connection.query("SELECT RELEASE_LOCK(?)",[lockName]);
}
