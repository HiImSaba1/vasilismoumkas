import { Fragment } from "react";
// Small, deliberately restricted link syntax. No HTML or external URL execution.
export function InlineContent({ text }: { text: string }) {
  const pattern = /\[([^\]\n]+)\]\((\/(?!\/)[^\s\\%()<>]*)\)/g;
  const parts: React.ReactNode[] = [];
  let end = 0;
  for (const match of text.matchAll(pattern)) {
    parts.push(text.slice(end, match.index));
    parts.push(<a key={match.index} href={match[2]} className="underline underline-offset-2">{match[1]}</a>);
    end = match.index! + match[0].length;
  }
  parts.push(text.slice(end));
  return <>{parts.map((part,index) => <Fragment key={index}>{part}</Fragment>)}</>;
}
