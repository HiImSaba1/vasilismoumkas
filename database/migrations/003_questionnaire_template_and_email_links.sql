SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

UPDATE email_templates
SET id = CONCAT('shift-', id)
WHERE id IN ('005','006','007','008','009','010');

UPDATE automation_jobs
SET template_id = CONCAT('shift-', template_id)
WHERE template_id IN ('005','006','007','008','009','010');

UPDATE email_deliveries
SET template_id = CONCAT('shift-', template_id)
WHERE template_id IN ('005','006','007','008','009','010');

UPDATE email_templates
SET id = LPAD(CAST(SUBSTRING(id, 7) AS UNSIGNED) + 1, 3, '0')
WHERE id LIKE 'shift-%';

UPDATE automation_jobs
SET template_id = LPAD(CAST(SUBSTRING(template_id, 7) AS UNSIGNED) + 1, 3, '0')
WHERE template_id LIKE 'shift-%';

UPDATE email_deliveries
SET template_id = LPAD(CAST(SUBSTRING(template_id, 7) AS UNSIGNED) + 1, 3, '0')
WHERE template_id LIKE 'shift-%';

INSERT INTO email_templates
  (id, name, purpose, subject, body_html, body_text, allowed_placeholders, trigger_description, is_active)
VALUES
  (
    '005',
    'Ερωτηματολόγιο Γάμου',
    'Αποστολή του ερωτηματολογίου ώστε να συγκεντρωθούν το πρόγραμμα και οι σημαντικές λεπτομέρειες της ημέρας.',
    'Ερωτηματολόγιο Γάμου',
    '<p>Καλησπέρα σας {{couple_names}},</p><p>Ελπίζω να είστε καλά.</p><p>Καθώς προχωράμε στα επόμενα βήματα της συνεργασίας μας, θα ήθελα να γνωρίσω λίγο καλύτερα εσάς και τον τρόπο με τον οποίο φαντάζεστε την ημέρα του γάμου σας.</p><p>Έχω ετοιμάσει ένα σύντομο ερωτηματολόγιο, το οποίο θα με βοηθήσει να κατανοήσω καλύτερα το πρόγραμμά σας, τις λεπτομέρειες της ημέρας και όλα όσα έχουν ιδιαίτερη σημασία για εσάς.</p><p>Όσο περισσότερα γνωρίζω, τόσο καλύτερα μπορώ να προετοιμαστώ, ώστε η φωτογραφική εμπειρία να είναι απόλυτα προσαρμοσμένη στις δικές σας ανάγκες και να κυλήσει με φυσικότητα και ηρεμία.</p><p>Μπορείτε να συμπληρώσετε το ερωτηματολόγιο στον παρακάτω σύνδεσμο:</p><p><strong>Ερωτηματολόγιο Γάμου</strong></p><p><a href="{{questionnaire_url}}">Πατήστε εδώ και συμπληρώστε</a></p><p>Δεν χρειάζεται να βιαστείτε· συμπληρώστε το όποτε σας εξυπηρετεί. Μόλις το λάβω, θα το μελετήσω προσεκτικά και θα είμαστε σε επικοινωνία για οτιδήποτε χρειαστεί μέχρι την ημέρα του γάμου σας.</p><p>Αν στο μεταξύ προκύψει οποιαδήποτε απορία, είμαι πάντα στη διάθεσή σας.</p><p>Σας ευχαριστώ και πάλι για την εμπιστοσύνη σας. Ανυπομονώ να συνεχίσουμε την προετοιμασία αυτής της τόσο ξεχωριστής ημέρας και να δημιουργήσουμε μαζί όμορφες αναμνήσεις που θα σας συντροφεύουν για μια ζωή.</p><p>Με εκτίμηση,<br>Βασίλης Μούμκας</p>',
    'Καλησπέρα σας {{couple_names}},\n\nΕλπίζω να είστε καλά.\n\nΚαθώς προχωράμε στα επόμενα βήματα της συνεργασίας μας, θα ήθελα να γνωρίσω λίγο καλύτερα εσάς και τον τρόπο με τον οποίο φαντάζεστε την ημέρα του γάμου σας.\n\nΈχω ετοιμάσει ένα σύντομο ερωτηματολόγιο, το οποίο θα με βοηθήσει να κατανοήσω καλύτερα το πρόγραμμά σας, τις λεπτομέρειες της ημέρας και όλα όσα έχουν ιδιαίτερη σημασία για εσάς.\n\nΌσο περισσότερα γνωρίζω, τόσο καλύτερα μπορώ να προετοιμαστώ, ώστε η φωτογραφική εμπειρία να είναι απόλυτα προσαρμοσμένη στις δικές σας ανάγκες και να κυλήσει με φυσικότητα και ηρεμία.\n\nΜπορείτε να συμπληρώσετε το ερωτηματολόγιο στον παρακάτω σύνδεσμο:\n\nΕρωτηματολόγιο Γάμου\n\nΠατήστε εδώ και συμπληρώστε:\n{{questionnaire_url}}\n\nΔεν χρειάζεται να βιαστείτε· συμπληρώστε το όποτε σας εξυπηρετεί. Μόλις το λάβω, θα το μελετήσω προσεκτικά και θα είμαστε σε επικοινωνία για οτιδήποτε χρειαστεί μέχρι την ημέρα του γάμου σας.\n\nΑν στο μεταξύ προκύψει οποιαδήποτε απορία, είμαι πάντα στη διάθεσή σας.\n\nΣας ευχαριστώ και πάλι για την εμπιστοσύνη σας. Ανυπομονώ να συνεχίσουμε την προετοιμασία αυτής της τόσο ξεχωριστής ημέρας και να δημιουργήσουμε μαζί όμορφες αναμνήσεις που θα σας συντροφεύουν για μια ζωή.\n\nΜε εκτίμηση,\nΒασίλης Μούμκας',
    JSON_ARRAY('couple_names', 'questionnaire_url'),
    'Send after the booking is confirmed and the couple questionnaire is ready.',
    1
  );

UPDATE email_templates
SET body_text = REGEXP_REPLACE(body_text, '\\{\\{https?://[^}]+/offer/[^}]+\\}\\}', '{{offer_url}}'),
    body_html = REGEXP_REPLACE(body_html, '\\{\\{https?://[^}]+/offer/[^}]+\\}\\}', '{{offer_url}}')
WHERE id = '001';

UPDATE email_templates
SET body_html = REPLACE(body_html, '{{offer_url}}', '<a href="{{offer_url}}">Δείτε την προσωπική σας προσφορά</a>')
WHERE id = '001' AND body_html NOT LIKE '%href="{{offer_url}}"%';

UPDATE email_templates
SET body_html = REPLACE(body_html, '{{recent_gallery_url}}', '<a href="{{recent_gallery_url}}">Δείτε ένα πρόσφατο ολοκληρωμένο γάμο</a>')
WHERE id = '001' AND body_html NOT LIKE '%href="{{recent_gallery_url}}"%';

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
