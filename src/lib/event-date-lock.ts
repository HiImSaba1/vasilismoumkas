import type { PoolConnection, RowDataPacket } from "mysql2/promise";

const dateKey=(value:Date|string)=>value instanceof Date
  ? `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`
  : value.slice(0,10);

export async function lockClientEventDate(connection:PoolConnection,value:Date|string|null,excludeClientId?:string){
  if(!value)return null;
  const eventDate=dateKey(value);
  const lockName=`moumkas:client-date:${eventDate}`;
  const[locks]=await connection.query<(RowDataPacket&{acquired:number})[]>("SELECT GET_LOCK(?,5) AS acquired",[lockName]);
  if(Number(locks[0]?.acquired)!==1)throw new Error(`The date ${eventDate} is being confirmed right now. Please try again.`);
  try{
    const[clients]=await connection.query<(RowDataPacket&{id:string;couple_names:string})[]>("SELECT id,couple_names FROM clients WHERE event_date=? AND (? IS NULL OR id<>?) LIMIT 1",[eventDate,excludeClientId??null,excludeClientId??null]);
    if(clients[0])throw new Error(`The date ${eventDate} is already booked by ${clients[0].couple_names}. Leads may share a date, but only one can become a client.`);
    return lockName;
  }catch(error){
    await releaseClientEventDate(connection,lockName);
    throw error;
  }
}

export async function releaseClientEventDate(connection:PoolConnection,lockName:string|null){
  if(lockName)await connection.query("SELECT RELEASE_LOCK(?)",[lockName]);
}
