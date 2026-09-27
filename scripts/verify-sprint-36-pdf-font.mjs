import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import fontkit from "@pdf-lib/fontkit";
import {PDFDocument} from "pdf-lib";

const bytes=await readFile(resolve(process.cwd(),"public/fonts/Roboto-Variable.ttf"));
const face=fontkit.create(bytes);
const sample="Ερωτηματολόγιο · Συμφωνητικό · Τιμολόγιο · Wedding · Baptism";
for(const character of sample){
  if(/\s|[·]/u.test(character))continue;
  const glyph=face.glyphForCodePoint(character.codePointAt(0));
  if(!glyph||glyph.id===0)throw new Error(`FAIL - Unicode PDF font is missing glyph U+${character.codePointAt(0).toString(16).toUpperCase()}`);
}
const pdf=await PDFDocument.create();
pdf.registerFontkit(fontkit);
const embedded=await pdf.embedFont(bytes,{subset:false});
const page=pdf.addPage();
page.drawText(sample,{x:40,y:700,size:14,font:embedded});
const output=await pdf.save();
if(output.length<100000)throw new Error("FAIL - bilingual PDF did not embed the Unicode font");
console.log("PASS - Roboto contains the required Greek and Latin glyphs.");
console.log("PASS - pdf-lib generated an in-memory bilingual PDF with the full embedded font.");
