SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(190) NOT NULL,
  ip_hash CHAR(64) NULL,
  succeeded TINYINT(1) NOT NULL DEFAULT 0,
  attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_attempts_time (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id CHAR(36) PRIMARY KEY,
  event_type ENUM('wedding','baptism') NOT NULL DEFAULT 'wedding',
  workflow_locale ENUM('el','en') NULL,
  status ENUM('new','awaiting-information','qualified','offer-draft','offer-sent','follow-up','accepted','lost','converted','completed') NOT NULL DEFAULT 'new',
  couple_names VARCHAR(255) NOT NULL,
  email VARCHAR(320) NULL,
  phone VARCHAR(60) NULL,
  event_date DATE NULL,
  ceremony_location VARCHAR(255) NULL,
  reception_location VARCHAR(255) NULL,
  guest_count INT UNSIGNED NULL,
  source VARCHAR(120) NULL,
  notes TEXT NULL,
  last_response_at DATETIME NULL,
  next_action_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leads_pipeline (status, event_date),
  INDEX idx_leads_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS client_workflow_steps (
  lead_id CHAR(36) NOT NULL,
  step_key VARCHAR(40) NOT NULL,
  status ENUM('not-done','pending','completed','skipped','accepted') NOT NULL,
  note VARCHAR(500) NULL,
  completed_at DATETIME NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (lead_id, step_key),
  CONSTRAINT fk_client_workflow_steps_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  INDEX idx_client_workflow_steps_status (status, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(190) NOT NULL UNIQUE,
  lead_id CHAR(36) NULL,
  event_type ENUM('wedding','baptism') NOT NULL,
  language ENUM('en','gr') NOT NULL DEFAULT 'en',
  client_name VARCHAR(255) NULL,
  client_email VARCHAR(320) NULL,
  status ENUM('draft','sent','viewed','accepted','rejected','expired','revoked') NOT NULL DEFAULT 'draft',
  expires_at DATETIME NULL,
  sent_at DATETIME NULL,
  first_viewed_at DATETIME NULL,
  accepted_at DATETIME NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_offers_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  INDEX idx_offers_status (status, created_at),
  INDEX idx_offers_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_booking_documents (
  lead_id CHAR(36) PRIMARY KEY,
  contract_url VARCHAR(2000) NULL,
  questionnaire_url VARCHAR(2000) NULL,
  invoice_url VARCHAR(2000) NULL,
  contract_status ENUM('not-sent','sent','signed') NOT NULL DEFAULT 'not-sent',
  questionnaire_status ENUM('not-sent','sent','completed') NOT NULL DEFAULT 'not-sent',
  invoice_status ENUM('not-issued','issued','paid') NOT NULL DEFAULT 'not-issued',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lead_booking_documents_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_document_records (
  id CHAR(36) PRIMARY KEY,
  lead_id CHAR(36) NOT NULL,
  document_type ENUM('questionnaire','contract','invoice') NOT NULL,
  template_key VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  document_data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lead_document_type (lead_id, document_type),
  CONSTRAINT fk_native_document_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_templates (
  id CHAR(36) PRIMARY KEY,
  template_key VARCHAR(80) NOT NULL UNIQUE,
  document_type ENUM('questionnaire','contract','invoice') NOT NULL,
  event_type ENUM('wedding','baptism') NOT NULL,
  locale ENUM('el','en') NOT NULL,
  name VARCHAR(255) NOT NULL,
  content JSON NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_document_template_scope (event_type,locale,document_type,is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offer_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id BIGINT UNSIGNED NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  metadata JSON NULL,
  occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_offer_events_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  INDEX idx_offer_events (offer_id, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clients (
  id CHAR(36) PRIMARY KEY,
  lead_id CHAR(36) NULL UNIQUE,
  accepted_offer_id BIGINT UNSIGNED NULL UNIQUE,
  event_type ENUM('wedding','baptism') NOT NULL DEFAULT 'wedding',
  couple_names VARCHAR(255) NOT NULL,
  email VARCHAR(320) NULL,
  phone VARCHAR(60) NULL,
  event_date DATE NULL,
  ceremony_location VARCHAR(255) NULL,
  reception_location VARCHAR(255) NULL,
  journey_stage VARCHAR(60) NOT NULL DEFAULT 'onboarding',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clients_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  CONSTRAINT fk_clients_offer FOREIGN KEY (accepted_offer_id) REFERENCES offers(id) ON DELETE SET NULL,
  INDEX idx_clients_event_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS onboarding (
  id CHAR(36) PRIMARY KEY,
  client_id CHAR(36) NOT NULL UNIQUE,
  questionnaire_status ENUM('not-sent','sent','completed') NOT NULL DEFAULT 'not-sent',
  agreement_status ENUM('not-sent','sent','approved') NOT NULL DEFAULT 'not-sent',
  invoice_status ENUM('not-issued','issued','part-paid','paid') NOT NULL DEFAULT 'not-issued',
  booking_status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  timeline_status ENUM('not-started','draft','sent','approved') NOT NULL DEFAULT 'not-started',
  production_status ENUM('not-started','event-complete','wedding-complete','editing','gallery-delivered') NOT NULL DEFAULT 'not-started',
  payload JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_onboarding_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS client_portals (
  id CHAR(36) PRIMARY KEY,
  client_id CHAR(36) NOT NULL UNIQUE,
  public_slug VARCHAR(190) NOT NULL UNIQUE,
  status ENUM('active','revoked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_client_portal_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS google_calendar_connections (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  account_email VARCHAR(320) NOT NULL,
  calendar_id VARCHAR(255) NOT NULL DEFAULT 'primary',
  refresh_token_ciphertext TEXT NOT NULL,
  refresh_token_iv VARCHAR(64) NOT NULL,
  refresh_token_tag VARCHAR(64) NOT NULL,
  scope TEXT NULL,
  connected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_sync_at DATETIME NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS google_calendar_events (
  client_id CHAR(36) NOT NULL PRIMARY KEY,
  google_event_id VARCHAR(255) NOT NULL,
  synced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_google_calendar_event_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE KEY uq_google_calendar_event_id (google_event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoice_payments (
  id CHAR(36) PRIMARY KEY,
  client_id CHAR(36) NOT NULL,
  invoice_document_id CHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_at DATE NOT NULL,
  payment_method VARCHAR(80) NULL,
  reference VARCHAR(190) NULL,
  note TEXT NULL,
  voided_at DATETIME NULL,
  void_reason VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_payments_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_invoice_payments_document FOREIGN KEY (invoice_document_id) REFERENCES lead_document_records(id) ON DELETE CASCADE,
  CONSTRAINT chk_invoice_payment_amount CHECK (amount > 0),
  INDEX idx_invoice_payments_active (client_id, voided_at, paid_at),
  INDEX idx_invoice_payments_document (invoice_document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questionnaires (
  id CHAR(36) PRIMARY KEY,
  client_id CHAR(36) NOT NULL UNIQUE,
  public_token_hash CHAR(64) NOT NULL UNIQUE,
  answers JSON NULL,
  submitted_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_questionnaires_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timelines (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(190) NOT NULL UNIQUE,
  client_id CHAR(36) NULL,
  language ENUM('en','gr') NOT NULL DEFAULT 'en',
  client_name VARCHAR(255) NULL,
  status ENUM('draft','published','revoked') NOT NULL DEFAULT 'draft',
  payload JSON NOT NULL,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_timelines_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  INDEX idx_timelines_status (status, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documents (
  id CHAR(36) PRIMARY KEY,
  client_id CHAR(36) NOT NULL,
  document_type ENUM('agreement','invoice','other') NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_documents_client (client_id, document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_templates (
  id VARCHAR(20) PRIMARY KEY,
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
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_template_variants (
  template_id VARCHAR(20) NOT NULL,
  event_type ENUM('wedding','baptism') NOT NULL,
  locale ENUM('el','en') NOT NULL,
  name VARCHAR(190) NOT NULL,
  purpose TEXT NULL,
  subject VARCHAR(500) NOT NULL,
  body_html MEDIUMTEXT NOT NULL,
  body_text MEDIUMTEXT NOT NULL,
  header_image VARCHAR(700) NULL,
  allowed_placeholders JSON NOT NULL,
  trigger_description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (template_id, event_type, locale),
  CONSTRAINT fk_email_template_variants_template FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE CASCADE,
  INDEX idx_email_template_variants_scope (event_type, locale, template_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS automation_jobs (
  id CHAR(36) PRIMARY KEY,
  job_key VARCHAR(190) NOT NULL UNIQUE,
  job_type VARCHAR(60) NOT NULL,
  lead_id CHAR(36) NULL,
  client_id CHAR(36) NULL,
  offer_id BIGINT UNSIGNED NULL,
  template_id VARCHAR(20) NULL,
  status ENUM('scheduled','processing','sent','cancelled','failed') NOT NULL DEFAULT 'scheduled',
  scheduled_for DATETIME NOT NULL,
  attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  locked_at DATETIME NULL,
  completed_at DATETIME NULL,
  preview_notified_at DATETIME NULL,
  payload JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_jobs_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_jobs_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  CONSTRAINT fk_jobs_template FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL,
  INDEX idx_jobs_due (status, scheduled_for)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_deliveries (
  id CHAR(36) PRIMARY KEY,
  template_id VARCHAR(20) NULL,
  lead_id CHAR(36) NULL,
  client_id CHAR(36) NULL,
  offer_id BIGINT UNSIGNED NULL,
  recipient VARCHAR(320) NOT NULL,
  rendered_subject VARCHAR(500) NOT NULL,
  rendered_html LONGTEXT NULL,
  rendered_text LONGTEXT NULL,
  idempotency_key VARCHAR(64) NULL,
  provider_message_id VARCHAR(255) NULL,
  status ENUM('queued','sent','failed','bounced','suppressed') NOT NULL DEFAULT 'queued',
  attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  failure_reason TEXT NULL,
  sent_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_deliveries_template FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL,
  CONSTRAINT fk_deliveries_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  CONSTRAINT fk_deliveries_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  CONSTRAINT fk_deliveries_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE SET NULL,
  UNIQUE INDEX uq_deliveries_idempotency (idempotency_key),
  INDEX idx_deliveries_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id CHAR(36) NULL,
  client_id CHAR(36) NULL,
  offer_id BIGINT UNSIGNED NULL,
  event_type VARCHAR(60) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  INDEX idx_activity_lead (lead_id, created_at),
  INDEX idx_activity_client (client_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id CHAR(36) PRIMARY KEY, slug VARCHAR(190) NOT NULL UNIQUE, title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL, date_shot DATE NULL, client_name VARCHAR(255) NULL, location VARCHAR(255) NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Wedding', tags JSON NOT NULL, header_image VARCHAR(700) NOT NULL,
  is_new TINYINT(1) NOT NULL DEFAULT 1, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_portfolio_order (is_new, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS portfolio_images (
  id CHAR(36) PRIMARY KEY, project_id CHAR(36) NOT NULL, image_path VARCHAR(700) NOT NULL,
  alt_text VARCHAR(500) NOT NULL, width INT UNSIGNED NOT NULL DEFAULT 1600, height INT UNSIGNED NOT NULL DEFAULT 1200,
  position TINYINT UNSIGNED NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_portfolio_image_project FOREIGN KEY (project_id) REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  UNIQUE KEY uq_portfolio_position (project_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_project_deletions (
  slug VARCHAR(190) PRIMARY KEY, deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_migrations (
  migration_key VARCHAR(190) PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  details JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
