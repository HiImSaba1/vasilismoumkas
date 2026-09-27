ALTER TABLE email_deliveries
  ADD COLUMN rendered_html LONGTEXT NULL AFTER rendered_subject,
  ADD COLUMN rendered_text LONGTEXT NULL AFTER rendered_html;
