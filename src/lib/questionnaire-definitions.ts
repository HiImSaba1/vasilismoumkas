export type QuestionnaireEventType="wedding"|"baptism";
export type QuestionnaireLanguage="gr"|"en";
export type QuestionnaireField={name:string;label:string;help:string};

const wedding:Record<QuestionnaireLanguage,QuestionnaireField[]>={
  en:[
    {name:"bride_name",label:"Bride full name",help:"Name exactly as it should appear in wedding documents."},
    {name:"bride_phone",label:"Bride phone",help:"Best number for wedding-day communication."},
    {name:"bride_email",label:"Bride email",help:"Primary email address."},
    {name:"groom_name",label:"Groom full name",help:"Name exactly as it should appear in wedding documents."},
    {name:"groom_phone",label:"Groom phone",help:"Best number for wedding-day communication."},
    {name:"groom_email",label:"Groom email",help:"Primary email address."},
    {name:"bride_preparation_address",label:"Bride preparation address",help:"Full address and any access or parking notes."},
    {name:"groom_preparation_address",label:"Groom preparation address",help:"Full address and any access or parking notes."},
    {name:"ceremony_date_time",label:"Ceremony date and time",help:"Confirmed start time and expected arrival guidance."},
    {name:"ceremony_location_address",label:"Ceremony church / location and address",help:"Full venue name and address."},
    {name:"ceremony_notes",label:"Ceremony information",help:"Traditions, restrictions and anything important for coverage."},
    {name:"reception_venue",label:"Reception venue",help:"Venue name, address and expected arrival time."},
    {name:"first_dance",label:"Will there be a first dance?",help:"Answer Yes or No and include the expected time if known."},
    {name:"bouquet_toss",label:"Will there be a bouquet toss?",help:"Answer Yes or No."},
    {name:"cake_cutting",label:"Will there be a cake cutting?",help:"Answer Yes or No."},
    {name:"fireworks",label:"Will there be fireworks?",help:"Answer Yes or No and note timing or venue restrictions."},
    {name:"guest_count",label:"Reception guest count",help:"Approximate number is sufficient."},
    {name:"wedding_planner",label:"Wedding planner",help:"Name, phone and email, or Direct when there is no planner."},
    {name:"special_events",label:"Special events I should know about",help:"Surprises, performances, traditions or important moments."},
    {name:"extra_notes",label:"Anything else about your day?",help:"Private family considerations, accessibility or photography priorities."},
  ],
  gr:[
    {name:"bride_name",label:"Ονοματεπωνυμο νυφης",help:"Οπως θελετε να εμφανιζεται στα εγγραφα του γαμου."},
    {name:"bride_phone",label:"Τηλεφωνο νυφης",help:"Ο καλυτερος αριθμος επικοινωνιας για την ημερα του γαμου."},
    {name:"bride_email",label:"Email νυφης",help:"Κυρια διευθυνση email."},
    {name:"groom_name",label:"Ονοματεπωνυμο γαμπρου",help:"Οπως θελετε να εμφανιζεται στα εγγραφα του γαμου."},
    {name:"groom_phone",label:"Τηλεφωνο γαμπρου",help:"Ο καλυτερος αριθμος επικοινωνιας για την ημερα του γαμου."},
    {name:"groom_email",label:"Email γαμπρου",help:"Κυρια διευθυνση email."},
    {name:"bride_preparation_address",label:"Διευθυνση προετοιμασιας νυφης",help:"Πληρης διευθυνση και πληροφοριες προσβασης ή parking."},
    {name:"groom_preparation_address",label:"Διευθυνση προετοιμασιας γαμπρου",help:"Πληρης διευθυνση και πληροφοριες προσβασης ή parking."},
    {name:"ceremony_date_time",label:"Ημερομηνια και ωρα μυστηριου",help:"Επιβεβαιωμενη ωρα εναρξης."},
    {name:"ceremony_location_address",label:"Εκκλησια και διευθυνση",help:"Πληρης ονομασια και διευθυνση."},
    {name:"ceremony_notes",label:"Πληροφοριες μυστηριου",help:"Παραδοσεις, περιορισμοι και οτιδηποτε σημαντικο για την καλυψη."},
    {name:"reception_venue",label:"Χωρος δεξιωσης",help:"Ονομασια, διευθυνση και αναμενομενη ωρα αφιξης."},
    {name:"first_dance",label:"Θα υπαρξει πρωτος χορος;",help:"Απαντηστε Ναι ή Οχι και προσθεστε ωρα αν ειναι γνωστη."},
    {name:"bouquet_toss",label:"Θα γινει ριψη ανθοδεσμης;",help:"Απαντηστε Ναι ή Οχι."},
    {name:"cake_cutting",label:"Θα γινει κοπη τουρτας;",help:"Απαντηστε Ναι ή Οχι."},
    {name:"fireworks",label:"Θα υπαρξουν πυροτεχνηματα;",help:"Προσθεστε ωρα και τυχον περιορισμους."},
    {name:"guest_count",label:"Αριθμος καλεσμενων",help:"Μια προσεγγιστικη εκτιμηση ειναι αρκετη."},
    {name:"wedding_planner",label:"Wedding planner",help:"Ονομα, τηλεφωνο και email ή απευθειας επικοινωνια."},
    {name:"special_events",label:"Ιδιαιτερες στιγμες",help:"Εκπληξεις, εθιμα ή σημαντικες στιγμες που πρεπει να γνωριζουμε."},
    {name:"extra_notes",label:"Οτιδηποτε αλλο για την ημερα σας",help:"Οικογενειακες ιδιαιτεροτητες, προσβασιμοτητα ή φωτογραφικες προτεραιοτητες."},
  ],
};

const baptism:Record<QuestionnaireLanguage,QuestionnaireField[]>={
  en:[
    {name:"child_name",label:"Child's full name",help:"Name exactly as it should appear in the baptism documents."},
    {name:"child_age",label:"Child's age",help:"Age on the baptism date."},
    {name:"parent_names",label:"Parents' full names",help:"Names and preferred contact person."},
    {name:"parent_phone",label:"Parent contact phone",help:"Best number for preparation and ceremony communication."},
    {name:"parent_email",label:"Parent email",help:"Primary email address for this collaboration."},
    {name:"godparent_names",label:"Godparent name or names",help:"Include a phone number when useful for coordination."},
    {name:"child_preparation",label:"Child preparation details",help:"Address, start time and the people who will be present."},
    {name:"ceremony_date_time",label:"Baptism date and time",help:"Confirmed ceremony start time."},
    {name:"ceremony_location_address",label:"Church and address",help:"Full church name, area and address."},
    {name:"ceremony_notes",label:"Ceremony information",help:"Church restrictions, traditions or anything important for photography."},
    {name:"reception_venue",label:"Reception venue",help:"Venue name, address and expected arrival time, when applicable."},
    {name:"guest_count",label:"Estimated guest count",help:"Approximate number is sufficient."},
    {name:"family_group_photos",label:"Important family group photographs",help:"List the combinations that should not be missed."},
    {name:"decoration_details",label:"Decoration and meaningful details",help:"Tell us about handmade, sentimental or important details."},
    {name:"special_moments",label:"Special moments or traditions",help:"Anything planned before, during or after the ceremony."},
    {name:"extra_notes",label:"Anything else about the baptism?",help:"Child sensitivities, accessibility or photography priorities."},
  ],
  gr:[
    {name:"child_name",label:"Ονοματεπωνυμο παιδιου",help:"Οπως θελετε να εμφανιζεται στα εγγραφα της βαπτισης."},
    {name:"child_age",label:"Ηλικια παιδιου",help:"Η ηλικια την ημερα της βαπτισης."},
    {name:"parent_names",label:"Ονοματεπωνυμα γονεων",help:"Προσθεστε και το βασικο προσωπο επικοινωνιας."},
    {name:"parent_phone",label:"Τηλεφωνο γονεα",help:"Ο καλυτερος αριθμος για την προετοιμασια και το μυστηριο."},
    {name:"parent_email",label:"Email γονεα",help:"Κυρια διευθυνση email για τη συνεργασια."},
    {name:"godparent_names",label:"Ονοματεπωνυμο νονου ή νονας",help:"Προσθεστε τηλεφωνο αν χρειαζεται για τον συντονισμο."},
    {name:"child_preparation",label:"Προετοιμασια παιδιου",help:"Διευθυνση, ωρα εναρξης και ποιοι θα παρευρισκονται."},
    {name:"ceremony_date_time",label:"Ημερομηνια και ωρα βαπτισης",help:"Επιβεβαιωμενη ωρα εναρξης του μυστηριου."},
    {name:"ceremony_location_address",label:"Εκκλησια και διευθυνση",help:"Πληρης ονομασια, περιοχη και διευθυνση."},
    {name:"ceremony_notes",label:"Πληροφοριες μυστηριου",help:"Περιορισμοι εκκλησιας, εθιμα ή οτιδηποτε σημαντικο για τη φωτογραφιση."},
    {name:"reception_venue",label:"Χωρος δεξιωσης",help:"Ονομασια, διευθυνση και ωρα αφιξης, αν υπαρχει δεξιωση."},
    {name:"guest_count",label:"Εκτιμωμενος αριθμος καλεσμενων",help:"Μια προσεγγιστικη εκτιμηση ειναι αρκετη."},
    {name:"family_group_photos",label:"Σημαντικες οικογενειακες φωτογραφιες",help:"Καταγραψτε τους συνδυασμους που δεν πρεπει να παραλειφθουν."},
    {name:"decoration_details",label:"Διακοσμηση και σημαντικες λεπτομερειες",help:"Χειροποιητα, συναισθηματικα ή σημαντικα αντικειμενα."},
    {name:"special_moments",label:"Ιδιαιτερες στιγμες ή εθιμα",help:"Οτιδηποτε εχει προγραμματιστει πριν, κατα τη διαρκεια ή μετα το μυστηριο."},
    {name:"extra_notes",label:"Οτιδηποτε αλλο για τη βαπτιση",help:"Ευαισθησιες του παιδιου, προσβασιμοτητα ή φωτογραφικες προτεραιοτητες."},
  ],
};

export function customQuestionnaireFields(source?:Record<string,unknown>){
  const raw=source?.custom_questions;
  if(typeof raw!=="string"||!raw.trim())return[];
  try{
    const parsed:unknown=JSON.parse(raw);
    if(!Array.isArray(parsed))return[];
    return parsed.flatMap((item,index):QuestionnaireField[]=>{
      if(!item||typeof item!=="object"||Array.isArray(item))return[];
      const value=item as Record<string,unknown>;
      const label=String(value.label??"").trim().slice(0,180);
      if(!label)return[];
      return[{name:`custom_${index+1}`,label,help:String(value.help??"").trim().slice(0,400)}];
    }).slice(0,20);
  }catch{return[]}
}
export function questionnaireFields(eventType:QuestionnaireEventType,language:QuestionnaireLanguage,source?:Record<string,unknown>){return[...(eventType==="baptism"?baptism:wedding)[language],...customQuestionnaireFields(source)]}
export function questionnaireFieldLabel(eventType:QuestionnaireEventType,language:QuestionnaireLanguage,name:string,source?:Record<string,unknown>){return questionnaireFields(eventType,language,source).find(field=>field.name===name)?.label??name.replaceAll("_"," ")}
export function sanitizeQuestionnaireAnswers(eventType:QuestionnaireEventType,language:QuestionnaireLanguage,input:Record<string,unknown>,source?:Record<string,unknown>){const allowed=new Set(questionnaireFields(eventType,language,source).map(field=>field.name));return Object.fromEntries(Object.entries(input).filter(([key])=>allowed.has(key)).map(([key,value])=>[key,String(value??"").trim().slice(0,5000)]))}
