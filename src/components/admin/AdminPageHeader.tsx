export function AdminPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="border-b border-ink-black/20 pb-5">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-[11px] uppercase leading-relaxed tracking-[0.12em] text-ink-black/60">{eyebrow}</p>
          <h1 className="mt-1 mb-0 text-[clamp(2rem,4.25vw,4rem)] font-light uppercase leading-[0.92] tracking-[-0.04em]">{title}</h1>
          <span className="mt-3 block max-w-4xl text-xl leading-[1.1em] text-ink-black/70">{description}</span>
        </div>
        {action}
      </div>
    </header>
  );
}
