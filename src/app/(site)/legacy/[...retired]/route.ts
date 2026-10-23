import {getPublicRedirects} from "@/lib/public-redirects";
export async function GET(request:Request,{params}:{params:Promise<{retired:string[]}>}) {
  const path=`/legacy/${(await params).retired.join("/")}`;
  const rule=(await getPublicRedirects()).find(item=>item.from===path);
  return rule ? Response.redirect(new URL(rule.to,request.url),301) : new Response("Not found",{status:404,headers:{"X-Robots-Tag":"noindex, nofollow"}});
}
