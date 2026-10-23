"use client";
import {useActionState} from "react";
import {uploadPageMediaAction} from "@/app/admin/pages/actions";
export function ContentMediaUpload({scope}:{scope:string}) {
  const[state,action,pending]=useActionState(uploadPageMediaAction,{success:false,message:""});
  return <details className="my-5 border bg-white p-4"><summary className="cursor-pointer text-sm">Upload to the existing website image library</summary><form action={action} className="mt-4 grid gap-3" data-admin-locale-isolated="true"><input type="hidden" name="scope" value={scope}/><input name="mediaFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required/><label className="grid gap-2 text-xs">Image alt text<input name="mediaAlt" minLength={3} maxLength={300} required className="border p-3 text-sm"/></label>{state.message&&<p role="status" className={state.success?"text-green-800":"text-red-700"}>{state.message}</p>}<button disabled={pending} className="w-fit bg-ink-black px-4 py-3 text-xs text-white">Upload image</button></form></details>;
}
