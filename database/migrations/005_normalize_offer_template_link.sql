SET NAMES utf8mb4;
UPDATE email_templates
SET body_text = REGEXP_REPLACE(body_text, '\\{\\{https?://[^}]+/offer/[^}]+\\}\\}', '{{offer_url}}'),
    body_html = REGEXP_REPLACE(body_html, '\\{\\{https?://[^}]+/offer/[^}]+\\}\\}', '{{offer_url}}')
WHERE id = '001';
UPDATE email_templates
SET body_html = REPLACE(body_html, '{{offer_url}}', '<a href="{{offer_url}}">Δείτε την προσωπική σας προσφορά</a>')
WHERE id = '001' AND body_html NOT LIKE '%href="{{offer_url}}"%';
