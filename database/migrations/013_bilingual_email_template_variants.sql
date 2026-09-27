CREATE TABLE IF NOT EXISTS email_template_variants (
  template_id VARCHAR(20) NOT NULL,
  event_type ENUM('wedding','baptism') NOT NULL,
  locale ENUM('el','en') NOT NULL,
  name VARCHAR(190) NOT NULL,
  purpose TEXT NULL,
  subject VARCHAR(500) NOT NULL,
  body_html MEDIUMTEXT NOT NULL,
  body_text MEDIUMTEXT NOT NULL,
  allowed_placeholders JSON NOT NULL,
  trigger_description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (template_id, event_type, locale),
  CONSTRAINT fk_email_template_variants_template
    FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE CASCADE,
  INDEX idx_email_template_variants_scope (event_type, locale, template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
