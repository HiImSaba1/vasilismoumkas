// FILE: src/app/(site)/data/TimelineData.ts

export interface MilestoneItem {
  time: string;
  title_gr: string;
  title_en: string;
  location_gr: string;
  location_en: string;
  desc_gr: string;
  desc_en: string;
}

export const defaultMilestones: MilestoneItem[] = [
  {
    time: "13:00",
    title_gr: "Παρουσία φωτογράφου στο σπίτι της νύφης",
    title_en: "Photographer arrival at Bride's home",
    location_gr: "Τρίλοφος Θεσσαλονίκης",
    location_en: "Trilofos, Thessaloniki",
    desc_gr: "Προσέλευση φωτογράφου για τη λήψη καλλιτεχνικών λεπτομερειών (νυφικά παπούτσια, δαχτυλίδια, προσκλητήριο, άρωμα, ανθοδέσμη) σε φωτεινό σημείο, ιδανικά κοντά σε παράθυρο.",
    desc_en: "Photographer arrival to capture artistic details (bridal shoes, rings, invitation, perfume, bouquet) in a well-lit area, ideally near a window."
  },
  {
    time: "13:30 - 16:30",
    title_gr: "Προετοιμασία νύφης",
    title_en: "Bride's preparation",
    location_gr: "Τρίλοφος Θεσσαλονίκης",
    location_en: "Trilofos, Thessaloniki",
    desc_gr: "Προετοιμασία της Κωνσταντίνας: τελικές πινελιές στο μακιγιάζ και τα μαλλιά, ντύσιμο με τη βοήθεια αγαπημένων προσώπων και συγκινητικές στιγμές με την οικογένεια που προσέρχεται στις 14:30.",
    desc_en: "Preparation of Konstantina: final makeup and hair touches, getting dressed with the help of loved ones, and emotional moments as the family arrives at 14:30."
  },
  {
    time: "14:00",
    title_gr: "Φωτογράφιση στις φίλες της νύφης",
    title_en: "Photoshoot with bridesmaids",
    location_gr: "Τρίλοφος Θεσσαλονίκης",
    location_en: "Trilofos, Thessaloniki",
    desc_gr: "Αυθόρμητες λήψεις με τις φίλες στο χώρο του πατρικού, προετοιμασία για το εορταστικό toast με σαμπάνια και εορταστική ατμόσφαιρα.",
    desc_en: "Candid shots with bridesmaids at the house, preparation for a celebratory champagne toast, and capturing the joyful atmosphere."
  },
  {
    time: "13:45 - 16:20",
    title_gr: "Παρουσία φωτογράφου στο σπίτι του γαμπρού",
    title_en: "Photographer arrival at Groom's home",
    location_gr: "Λακκιά Θεσσαλονίκης",
    location_en: "Lakkia, Thessaloniki",
    desc_gr: "Προετοιμασία Νίκου: φωτογράφιση λεπτομερειών (κοστούμι, ρολόι, μανικετόκουμπα), αυθόρμητες στιγμές ντυσίματος και χαλαρός εορτασμός με φίλους και συνοδεία ποτού.",
    desc_en: "Preparation of Nikos: capturing details (suit, watch, cufflinks), candid moments while getting dressed, and a relaxed celebration with friends and a drink."
  },
  {
    time: "18:00",
    title_gr: "Μυστήριο",
    title_en: "Wedding Ceremony",
    location_gr: "Ιερός Ναός Αγίου Κυρίλου και Μεθοδίου, Θεσσαλονίκη",
    location_en: "St. Cyril and Methodius Church, Thessaloniki",
    desc_gr: "Πλήρης φωτογραφική κάλυψη του μυστηρίου. Ο Νίκος στην εκκλησία έως τις 17:35 για λήψεις με συγγενείς, στολισμός έτοιμος από 17:15, προσέλευση καλεσμένων 17:40.",
    desc_en: "Full photographic coverage of the ceremony. Nikos at church by 17:35 for portraits, venue decor ready by 17:15, and guest arrival at 17:40."
  },
  {
    time: "18:45 - 19:00",
    title_gr: "Φωτογράφιση ζευγαριού με συγγενείς & φίλους",
    title_en: "Group Photoshoot",
    location_gr: "Εκκλησία",
    location_en: "Church",
    desc_gr: "Ομαδικές λήψεις υψηλής αισθητικής με γονείς, κουμπάρους και στενούς φίλους στο προαύλιο της εκκλησίας αμέσως μετά την ολοκλήρωση του μυστηρίου.",
    desc_en: "High-aesthetic group portraits with parents, wedding sponsors, and close friends at the church courtyard immediately following the ceremony."
  },
  {
    time: "19:15 - 20:00",
    title_gr: "Φωτογράφιση ζευγαριού",
    title_en: "Couple Photoshoot",
    location_gr: "Μακεδονία Παλλάς",
    location_en: "Makedonia Palace",
    desc_gr: "Καλλιτεχνική, κινηματογραφική φωτογράφιση του ζευγαριού στο Μακεδονία Παλλάς, εκμεταλλευόμενοι το ιδανικό φως για πορτρέτα που αναδεικνύουν το στυλ και τη χημεία τους.",
    desc_en: "Artistic, cinematic couple photoshoot at Makedonia Palace, leveraging the perfect lighting for portraits that highlight their style and chemistry."
  },
  {
    time: "20:45",
    title_gr: "Είσοδος ζευγαριού στη δεξίωση",
    title_en: "Couple Entrance at Reception",
    location_gr: "Allea",
    location_en: "Allea",
    desc_gr: "Η μεγάλη είσοδος του ζευγαριού στον χώρο της δεξίωσης Allea, καταγράφοντας τον ενθουσιασμό των καλεσμένων και την πρώτη εικόνα του ζευγαριού στο πάρτι.",
    desc_en: "The grand entrance of the couple at Allea reception venue, capturing the guests' enthusiasm and the couple's first moments at the party."
  },
  {
    time: "23:30",
    title_gr: "Ολοκλήρωση φωτογραφικής κάλυψης",
    title_en: "End of Photographic Coverage",
    location_gr: "Allea",
    location_en: "Allea",
    desc_gr: "Ολοκλήρωση της 10ωρης φωτογραφικής κάλυψης μετά την αποτύπωση των πιο κεφάτων στιγμών της βραδιάς και του πάρτι.",
    desc_en: "Completion of 10 hours of photographic coverage after capturing the most energetic and joyful moments of the evening and the dance floor."
  }
];