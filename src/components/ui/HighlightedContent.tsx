import {InlineContent} from "./InlineContent";
import { Fragment } from "react";
// Keep the original colour accents when their words remain in edited copy.
export function HighlightedContent({ text, phrases }: { text: string; phrases: string[] }) {
  if (/\[[^\]]+\]\(\//.test(text)) return <InlineContent text={text}/>;
  const escaped = phrases.map(phrase => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");
  return <>{text.split(pattern).map((part, index) => <Fragment key={index}>{phrases.includes(part) ? <span className="text-red-600">{part}</span> : part}</Fragment>)}</>;
}
