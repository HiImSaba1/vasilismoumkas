import type { ReactNode } from "react";

const tones={green:"bg-green-100 text-green-900",orange:"bg-orange-100 text-orange-900",red:"bg-red-100 text-red-900",blue:"bg-blue-100 text-blue-900",grey:"bg-zinc-100 text-zinc-700"} as const;

export function ClientWorkspaceSection({title,status,tone="grey",summary,children,id}:{title:string;status:string;tone?:keyof typeof tones;summary:string;children:ReactNode;id?:string}){
  return <details id={id} name="client-workspace" className="group border-b border-ink-black/15" data-client-workspace-section>
    <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-black hover:text-white"><div className="min-w-0"><div className="flex min-w-0 flex-wrap items-center gap-2"><h2 className="min-w-0 break-words font-light uppercase">{title}</h2><span className={`shrink-0 px-2 py-1 text-[12px]  uppercase ${tones[tone]}`}>{status}</span></div><p className="mt-0.5 line-clamp-2 text-[11px] leading-snug opacity-55">{summary}</p></div><span className="shrink-0 text-lg group-open:rotate-45">+</span></summary>
    <div className="min-w-0 border-t border-ink-black/10 bg-[#f7f3e9] p-4">{children}</div>
  </details>;
}
