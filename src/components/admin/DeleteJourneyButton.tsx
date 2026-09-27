"use client";
import { useCallback, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";

export function DeleteJourneyButton({
  id,
  name,
  action,
  label,
}: {
  id: string;
  name: string;
  action: (data: FormData) => void | Promise<void>;
  label: string;
}) {
  const [step, setStep] = useState(0);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const mount = useCallback((node: HTMLSpanElement | null) => {
    const summary =
      node
        ?.closest("details")
        ?.querySelector<HTMLElement>(":scope > summary") ?? null;
    setPortalHost((current) => (current === summary ? current : summary));
  }, []);
  const stop = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const trigger = (
    <button
      type="button"
      onClick={(event) => {
        stop(event);
        setStep(1);
      }}
      aria-label={label}
      title={`${label} · permanently removes the complete connected journey`}
      className="ml-2 flex size-11 shrink-0 items-center justify-center bg-red-800 text-white transition-colors hover:bg-red-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
    >
      <Trash2 className="size-5" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
  const confirmation =
    step > 0 && typeof document !== "undefined"
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${label} confirmation`}
            className="fixed inset-0 z-[100] grid place-items-center bg-ink-black/70 p-4"
            onClick={() => setStep(0)}
          >
            <div
              className="w-full max-w-lg border border-red-500 bg-red-50 p-5 text-red-950 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {step === 1 ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center bg-red-800 text-white">
                      <Trash2 className="size-5" />
                    </span>
                    <p className="text-sm font-semibold uppercase">
                      Permanent journey deletion
                    </p>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed">
                    Delete {name} and every connected offer, client, portal,
                    document, private file, timeline, email, automation and
                    activity record?
                  </p>
                  <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="border border-red-300 px-4 py-3 text-[10px] uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-red-800 px-4 py-3 text-[10px] uppercase text-white"
                    >
                      Yes, continue
                    </button>
                  </div>
                </>
              ) : (
                <form action={action}>
                  <input type="hidden" name="id" value={id} />
                  <p className="text-sm font-semibold uppercase">
                    Final confirmation
                  </p>
                  <p className="mt-3 text-sm leading-relaxed">
                    This complete journey cannot be recovered from the admin.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="border border-red-300 px-4 py-3 text-[10px] uppercase"
                    >
                      Cancel
                    </button>
                    <button className="bg-red-900 px-4 py-3 text-[10px] uppercase text-white">
                      Permanently delete everything
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;
  return (
    <>
      <span ref={mount} className="hidden" />
      {portalHost && createPortal(trigger, portalHost)}
      {confirmation}
    </>
  );
}
