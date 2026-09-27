import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const required = (name, allowEmpty = false) => {
  const value = process.env[name];
  if (value === undefined || (!allowEmpty && !value)) throw new Error(`${name} is not configured.`);
  return value;
};

const db = await mysql.createConnection({
  host: required("DB_HOST"),
  port: Number(process.env.DB_PORT ?? 3306),
  database: required("DB_NAME"),
  user: required("DB_USER"),
  password: required("DB_PASSWORD", true),
  charset: "utf8mb4",
  multipleStatements: true,
});
const source = await fs.readFile("client_emails_as_source_of_truth.txt", "utf8");
const lines = source.split(/\r?\n/);
const placeholders = {
  "000": ["couple_names"],
  "001": ["couple_names", "offer_url", "recent_gallery_url"],
  "002": ["couple_names"],
  "003": ["couple_names"],
  "004": ["couple_names", "questionnaire_url", "agreement_url", "invoice_url"],
  "005": ["couple_names", "questionnaire_url"],
  "006": ["agreement_url"],
  "007": ["invoice_url", "bank_details"],
  "008": ["couple_names", "wedding_date"],
  "009": ["couple_names"],
  "010": ["couple_names", "wedding_gallery_url", "google_review_url"],
  "011": ["couple_names", "timeline_url"],
};
const tokens = [
  [/(Γιώργο\s*(?:&|και)\s*Μαρία)/g, "{{couple_names}}"],
  [/\[LINK ΠΡΟΣΦΟΡΑΣ\]/g, "{{offer_url}}"],
  [/\[RECENT WEDDING GALLERY\]/g, "{{recent_gallery_url}}"],
  [/\[Wedding Gallery Link\]/gi, "{{wedding_gallery_url}}"],
  [/\[Google Review Link\]/gi, "{{google_review_url}}"],
  [/\[Timeline Link\]/gi, "{{timeline_url}}"],
];
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const transform = (value) => tokens.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
const linkifyPlaceholders = (value) => value.replace(/{{\s*([a-z0-9_]+_url)\s*}}/gi, '<a href="{{$1}}">{{$1}}</a>');
const html = (value) => linkifyPlaceholders(value.split(/\n{2,}/).map((block) => `<p>${escapeHtml(block).replaceAll("\n", "<br>")}</p>`).join("\n"));
const upsert = `INSERT INTO email_templates (id,name,purpose,subject,body_html,body_text,allowed_placeholders,trigger_description,is_active)
  VALUES (?,?,?,?,?,?,?,?,1)
  ON DUPLICATE KEY UPDATE name=VALUES(name),purpose=VALUES(purpose),subject=VALUES(subject),body_html=VALUES(body_html),body_text=VALUES(body_text),allowed_placeholders=VALUES(allowed_placeholders),trigger_description=VALUES(trigger_description),is_active=1`;

try {
  for (let number = 0; number <= 10; number++) {
    const sourceId = String(number).padStart(3, "0");
    const targetId = String(number >= 5 ? number + 1 : number).padStart(3, "0");
    const starts = lines.map((line, index) => line.trim().toUpperCase() === `TEMPLATE ${sourceId}` ? index : -1).filter((index) => index >= 0);
    const start = starts.at(-1);
    if (start === undefined) throw new Error(`Template ${sourceId} not found`);
    let end = lines.length;
    for (let index = start + 1; index < lines.length; index++) {
      if (/^TEMPLATE \d{3}$/i.test(lines[index].trim()) || /^={5,}$/.test(lines[index].trim()) || /^(third|fourth) email$/i.test(lines[index].trim())) { end = index; break; }
    }
    const block = lines.slice(start + 1, end);
    const name = block.find((line) => line.trim())?.trim() ?? `Template ${targetId}`;
    const subjectLabel = block.findIndex((line) => line.trim().toLowerCase() === "subject:");
    if (subjectLabel < 0) throw new Error(`Subject missing for ${sourceId}`);
    const subjectIndex = block.findIndex((line, index) => index > subjectLabel && line.trim());
    const subject = transform(block[subjectIndex].trim());
    const body = transform(block.slice(subjectIndex + 1).join("\n").trim());
    await db.execute(upsert, [targetId, name, `CRM journey Template ${targetId}`, subject, html(body), body, JSON.stringify(placeholders[targetId]), `Workflow trigger defined in the Vasilis Moumkas CRM source of truth for Template ${targetId}.`]);
  }

  const questionnaireText = `Καλησπέρα σας {{couple_names}},\n\nΕλπίζω να είστε καλά.\n\nΚαθώς προχωράμε στα επόμενα βήματα της συνεργασίας μας, θα ήθελα να γνωρίσω λίγο καλύτερα εσάς και τον τρόπο με τον οποίο φαντάζεστε την ημέρα του γάμου σας.\n\nΈχω ετοιμάσει ένα σύντομο ερωτηματολόγιο, το οποίο θα με βοηθήσει να κατανοήσω καλύτερα το πρόγραμμά σας, τις λεπτομέρειες της ημέρας και όλα όσα έχουν ιδιαίτερη σημασία για εσάς.\n\nΌσο περισσότερα γνωρίζω, τόσο καλύτερα μπορώ να προετοιμαστώ, ώστε η φωτογραφική εμπειρία να είναι απόλυτα προσαρμοσμένη στις δικές σας ανάγκες και να κυλήσει με φυσικότητα και ηρεμία.\n\nΜπορείτε να συμπληρώσετε το ερωτηματολόγιο στον παρακάτω σύνδεσμο:\n\nΕρωτηματολόγιο Γάμου\n\nΠατήστε εδώ και συμπληρώστε:\n{{questionnaire_url}}\n\nΔεν χρειάζεται να βιαστείτε· συμπληρώστε το όποτε σας εξυπηρετεί. Μόλις το λάβω, θα το μελετήσω προσεκτικά και θα είμαστε σε επικοινωνία για οτιδήποτε χρειαστεί μέχρι την ημέρα του γάμου σας.\n\nΑν στο μεταξύ προκύψει οποιαδήποτε απορία, είμαι πάντα στη διάθεσή σας.\n\nΣας ευχαριστώ και πάλι για την εμπιστοσύνη σας. Ανυπομονώ να συνεχίσουμε την προετοιμασία αυτής της τόσο ξεχωριστής ημέρας και να δημιουργήσουμε μαζί όμορφες αναμνήσεις που θα σας συντροφεύουν για μια ζωή.\n\nΜε εκτίμηση,\nΒασίλης Μούμκας`;
  const questionnaireHtml = html(questionnaireText).replace('<p>Πατήστε εδώ και συμπληρώστε:<br><a href="{{questionnaire_url}}">{{questionnaire_url}}</a></p>', '<p><a href="{{questionnaire_url}}">Πατήστε εδώ και συμπληρώστε</a></p>');
  await db.execute(upsert, ["005", "Ερωτηματολόγιο Γάμου", "Αποστολή του ερωτηματολογίου και συλλογή των λεπτομερειών της ημέρας.", "Ερωτηματολόγιο Γάμου", questionnaireHtml, questionnaireText, JSON.stringify(placeholders["005"]), "Send after booking confirmation when the couple questionnaire is ready."]);
  await db.query(await fs.readFile("database/migrations/007_combine_portal_email_template.sql", "utf8"));
  await db.query(await fs.readFile("database/migrations/008_compact_email_template_numbers.sql", "utf8"));
  console.log("Seeded active Templates 000-009, including consolidated Client Portal Template 005.");
} finally {
  await db.end();
}
