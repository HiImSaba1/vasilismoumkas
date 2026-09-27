-- Keep Template 001 aligned with the offer system's 30-day validity window.
UPDATE email_templates
SET body_html = REPLACE(REPLACE(body_html, 'επόμενες 15 ημέρες', 'επόμενες 30 ημέρες'), 'next 15 days', 'next 30 days'),
    body_text = REPLACE(REPLACE(body_text, 'επόμενες 15 ημέρες', 'επόμενες 30 ημέρες'), 'next 15 days', 'next 30 days'),
    version = version + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = '001';

UPDATE email_template_variants
SET body_html = REPLACE(REPLACE(body_html, 'επόμενες 15 ημέρες', 'επόμενες 30 ημέρες'), 'next 15 days', 'next 30 days'),
    body_text = REPLACE(REPLACE(body_text, 'επόμενες 15 ημέρες', 'επόμενες 30 ημέρες'), 'next 15 days', 'next 30 days'),
    version = version + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE template_id = '001';
