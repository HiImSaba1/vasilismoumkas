import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const required = (name, allowEmpty = false) => {
  const value = process.env[name];
  if (value === undefined && allowEmpty) return "";
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
};

const sources = [
  { eventType: "wedding", locale: "el", file: "client-files-for-changes-in-admin/Email Templates 000–009 GR.txt" },
  { eventType: "wedding", locale: "en", file: "client-files-for-changes-in-admin/Email Templates 000–009 ENG.txt" },
  { eventType: "baptism", locale: "el", file: "client-files-for-changes-in-admin/Baptism Email Templates 000–009 GR.txt" },
  { eventType: "baptism", locale: "en", file: "client-files-for-changes-in-admin/Baptism Email Templates 000–009 ENG.txt" },
];

const replacements = [
  [/επόμενες 15 ημέρες/giu, "επόμενες 30 ημέρες"],
  [/next 15 days/giu, "next 30 days"],
  [/\[(?:ΟΝΟΜΑΤΑ ΓΟΝΕΩΝ|PARENTS[’'] NAMES)\]/giu, "{{parents_names}}"],
  [/\[(?:ΟΝΟΜΑ ΠΑΙΔΙΟΥ|CHILD[’']S NAME)\]/giu, "{{child_name}}"],
  [/\[(?:ΟΝΟΜΑΤΑ|NAMES)\]/giu, "{{couple_names}}"],
  [/\[(?:ΗΜΕΡΟΜΗΝΙΑ|WEDDING DATE|DATE)\]/giu, "{{event_date}}"],
  [/\[(?:LINK ΠΡΟΣΦΟΡΑΣ|PROPOSAL LINK)\]/giu, "{{offer_url}}"],
  [/\[RECENT WEDDING GALLERY\]/giu, "{{recent_gallery_url}}"],
  [/\[(?:ΑΝΟΙΓΜΑ CLIENT PORTAL|OPEN CLIENT PORTAL)\]/giu, "{{portal_url}}"],
  [/\[WEDDING GALLERY LINK\]/giu, "{{wedding_gallery_url}}"],
  [/\[CHRISTENING GALLERY LINK\]/giu, "{{baptism_gallery_url}}"],
];
const transform = (value) => replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const toHtml = (value) => escapeHtml(value).split(/\n{2,}/).map((block) => `<p>${block.replaceAll("\n", "<br>")}</p>`).join("\n").replace(/{{\s*([a-z0-9_]+_url)\s*}}/gi, '<a href="{{$1}}">{{$1}}</a>');
const placeholdersIn = (value) => [...new Set([...value.matchAll(/{{\s*([a-z0-9_]+)\s*}}/gi)].map((match) => match[1]))];
const firstNonEmpty = (lines, start) => lines.findIndex((line, index) => index >= start && line.trim());

function parseTemplates(source) {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/);
  const starts = lines.map((line, index) => /^TEMPLATE \d{3}$/i.test(line.trim()) ? index : -1).filter((index) => index >= 0);
  return starts.map((start, position) => {
    const id = lines[start].trim().slice(-3);
    const end = starts[position + 1] ?? lines.findIndex((line, index) => index > start && /^━+$/.test(line.trim()));
    const rawBlock = lines.slice(start + 1, end < 0 ? lines.length : end);
    while (rawBlock.at(-1)?.trim() === "" || /^━+$/.test(rawBlock.at(-1)?.trim() ?? "")) rawBlock.pop();
    const nameIndex = firstNonEmpty(rawBlock, 0);
    const subjectLabel = rawBlock.findIndex((line) => /^(Θέμα email|Email subject):$/iu.test(line.trim()));
    const bodyLabel = rawBlock.findIndex((line) => /^(Κείμενο|Message):$/iu.test(line.trim()));
    const timingLabel = rawBlock.findIndex((line) => /^(Χρόνος αποστολής|Sending time):$/iu.test(line.trim()));
    if (nameIndex < 0 || subjectLabel < 0 || bodyLabel < 0) throw new Error(`Incomplete source block for Template ${id}`);
    const subject = transform(rawBlock.slice(subjectLabel + 1, bodyLabel).filter((line) => line.trim()).join(" ").trim());
    const body = transform(rawBlock.slice(bodyLabel + 1).join("\n").trim());
    const trigger = timingLabel >= 0 ? rawBlock.slice(timingLabel + 1, subjectLabel).filter((line) => line.trim()).join(" ").trim() : "";
    return { id, name: rawBlock[nameIndex].trim(), subject, body, trigger, placeholders: placeholdersIn(`${subject}\n${body}`) };
  });
}

const db = await mysql.createConnection({
  host: required("DB_HOST"),
  port: Number(process.env.DB_PORT ?? 3306),
  database: required("DB_NAME"),
  user: required("DB_USER"),
  password: required("DB_PASSWORD", true),
  charset: "utf8mb4",
  multipleStatements: true,
});

try {
  await db.query(await fs.readFile("database/migrations/013_bilingual_email_template_variants.sql", "utf8"));
  for (const source of sources) {
    const templates = parseTemplates(await fs.readFile(source.file, "utf8"));
    if (templates.length !== 10) throw new Error(`${source.file} contains ${templates.length} templates instead of 10.`);
    for (const template of templates) {
      const purpose = `${source.eventType === "wedding" ? "Wedding" : "Baptism"} workflow · Template ${template.id}`;
      await db.execute(`INSERT INTO email_templates (id,name,purpose,subject,body_html,body_text,allowed_placeholders,trigger_description,is_active)
        VALUES (?,?,?,?,?,?,?,?,1) ON DUPLICATE KEY UPDATE id=VALUES(id)`, [template.id, template.name, purpose, template.subject, toHtml(template.body), template.body, JSON.stringify(template.placeholders), template.trigger]);
      await db.execute(`INSERT INTO email_template_variants (template_id,event_type,locale,name,purpose,subject,body_html,body_text,allowed_placeholders,trigger_description,is_active)
        VALUES (?,?,?,?,?,?,?,?,?,?,1)
        ON DUPLICATE KEY UPDATE name=VALUES(name),purpose=VALUES(purpose),subject=VALUES(subject),body_html=VALUES(body_html),body_text=VALUES(body_text),allowed_placeholders=VALUES(allowed_placeholders),trigger_description=VALUES(trigger_description),is_active=1,version=version+1`,
      [template.id, source.eventType, source.locale, template.name, purpose, template.subject, toHtml(template.body), template.body, JSON.stringify(template.placeholders), template.trigger]);
    }
    console.log(`Seeded ${source.eventType}/${source.locale}: Templates 000-009`);
  }
} finally {
  await db.end();
}
