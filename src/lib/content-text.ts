export function contentWords(text: string): string[] {
  return text.match(/\[[^\]\n]+\]\(\/(?!\/)[^\s\\%()<>]*\)|\S+/g) ?? [];
}
