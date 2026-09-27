"use client";

import { format, isValid } from "date-fns";
import type { ReactNode } from "react";

type Props = {
  label: string;
  name: string;
  initialDate?: Date;
  help?: ReactNode;
};

const inputValue = (date: Date | undefined) => date && isValid(date) ? format(date, "yyyy-MM-dd") : "";

export function AdminDatePicker({ label, name, initialDate, help }: Props) {
  const currentYear = new Date().getFullYear();
  return <label className="flex flex-col gap-1 anim-input" data-admin-date-picker>
    <span className="text-[1rem] uppercase text-ink-black/70 lg:text-[1.2rem]">{label}{help}</span>
    <input
      type="date"
      name={name}
      defaultValue={inputValue(initialDate)}
      min={`${currentYear - 1}-01-01`}
      max={`${currentYear + 10}-12-31`}
      required
      data-testid={`${name}-native-input`}
      className="w-full border-0 border-b border-ink-black/50 bg-transparent py-2 text-lg text-ink-black outline-none [color-scheme:light] focus:border-ink-black lg:text-xl"
    />
    <span className="mt-1 text-[12px]  uppercase tracking-[0.12em] text-ink-black/45">Tap to choose day, month and year</span>
  </label>;
}
