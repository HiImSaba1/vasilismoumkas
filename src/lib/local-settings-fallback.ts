// Only the development server may render defaults for an absent settings table.
// Writes, authentication failures and production schema failures still fail closed.
let warned=false;
export function allowLocalMissingSettings(error:unknown){
  if(process.env.NODE_ENV!=="development"||!error||typeof error!=="object"||!("code" in error)||error.code!=="ER_NO_SUCH_TABLE"||!("sqlMessage" in error)||typeof error.sqlMessage!=="string"||!/[.'`]site_settings['`]?\s+doesn't exist/i.test(error.sqlMessage))return false;
  if(!warned){console.warn("LOCAL PREVIEW: site_settings is absent. Public defaults are shown; content saving requires the existing schema. No tables were created.");warned=true;}
  return true;
}
