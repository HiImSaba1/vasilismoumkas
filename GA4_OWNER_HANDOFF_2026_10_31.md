# Για τον Βασίλη — στοιχεία και έλεγχος GA4

## Τι χρειαζόμαστε από τον λογαριασμό σου

1. Google Analytics → επίλεξε **VasilisMoumkas Photography - GA4**, Property ID **382897592**.
2. Admin → Data collection and modification → Data streams → άνοιξε το Web stream.
3. Στείλε screenshot με το stream URL και το **Measurement ID `G-…`**. Το Property ID δεν αρκεί για εγκατάσταση.
4. Σημείωσε τη ζώνη ώρας της ιδιοκτησίας και τυχόν Internal traffic / Developer traffic filters.
5. Έλεγξε και την παλιά ιδιοκτησία **358699704 — MonsterInsights**: ποιο stream περιλαμβάνει και μέχρι πότε υπάρχουν δεδομένα.

Μην στείλεις κωδικούς πρόσβασης, recovery codes ή cookies. Η πρόσβαση δεν υπάρχει στο δικό μας browser.

## Τι γνωρίζουμε μέχρι τώρα

Η αναζήτηση στον κώδικα δεν εντόπισε εγκατάσταση GA4/GTM. Το cookie banner αποθηκεύει αποδοχή, αλλά αυτό από μόνο του δεν αποτελεί εγκατάσταση Analytics. Δεν έχει ολοκληρωθεί live network audit ή επιβεβαίωση Realtime/DebugView. Δεν συμπεραίνουμε μηδενική επισκεψιμότητα από κενές αναφορές ή σφάλματα του Analytics.

## Μετά την επιβεβαίωση του σωστού stream

- Θα συνδεθεί μόνο το επιβεβαιωμένο Measurement ID στο production, χωρίς αλλαγή design, ports ή application paths.
- Θα επαληθευτεί καθαρή συνεδρία πριν την αποδοχή, μετά το Accept και μετά το Decline. Προτεινόμενη υλοποίηση: basic consent, χωρίς φόρτωση Google tags πριν την αποδοχή.
- Θα επιλεγεί μία μέθοδος page_view. Αν χρησιμοποιηθούν χειροκίνητα page_view για το Next.js routing, πρέπει να απενεργοποιηθούν και τα pageviews βάσει browser history στο Enhanced Measurement του stream· το `send_page_view:false` μόνο του δεν αποτρέπει αυτά τα events.
- Θα ελεγχθούν Home → About → Portfolio → Contact, σωστό page_location/page_title και απουσία διπλοκαταγραφών. Δεν θα περιλαμβάνονται ιδιωτικά portal/admin/offer tokens ή στοιχεία πελατών στα payloads.
- Σε browser χωρίς ad blocker θα γίνει μία δοκιμαστική επίσκεψη και παράλληλος έλεγχος σε Realtime/DebugView. Χρειαζόμαστε screenshot λήψης στο σωστό property, όχι μόνο παρουσία script.

## Ιστορική αναφορά 4–28 Οκτωβρίου 2026

Για κάθε διαθέσιμη ιδιοκτησία: ακριβές property/stream, timezone, χρονικό διάστημα συμπεριλαμβανομένων των δύο ημερομηνιών, Total users, Sessions και κατανομή ανά χώρα. Να αναφέρονται φίλτρα και περιορισμοί. Αν δεν υπήρχε συλλογή, δεν μπορούμε να ανακατασκευάσουμε τα χαμένα Analytics από Search Console clicks. Δεν αλλάζουμε φίλτρα πριν καταγράψουμε τι ισχύει.

## Πηγές υλοποίησης

- [Google: consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [Google: measure pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Google: single-page applications](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)

Κατάσταση: αναμονή στοιχείων/access από τον Βασίλη. Καμία αλλαγή Analytics δεν εκτελέστηκε.
