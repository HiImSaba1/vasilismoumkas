ALTER TABLE collaborators
  ADD COLUMN specialty ENUM('photographer','videographer','both') NOT NULL DEFAULT 'photographer' AFTER full_name,
  ADD COLUMN base_location VARCHAR(255) NULL AFTER phone,
  ADD COLUMN service_areas TEXT NULL AFTER base_location,
  ADD COLUMN website_url VARCHAR(1000) NULL AFTER service_areas,
  ADD COLUMN internal_notes TEXT NULL AFTER website_url,
  ADD INDEX idx_collaborator_email (email),
  ADD INDEX idx_collaborator_phone (phone);

ALTER TABLE client_team_assignments
  ADD COLUMN fee_vat_status ENUM('unspecified','included','excluded') NOT NULL DEFAULT 'unspecified' AFTER fee,
  ADD COLUMN travel_terms TEXT NULL AFTER fee_vat_status,
  ADD COLUMN deliverables TEXT NULL AFTER travel_terms,
  ADD COLUMN deliverables_due VARCHAR(500) NULL AFTER deliverables,
  ADD COLUMN additional_coverage TEXT NULL AFTER deliverables_due,
  ADD COLUMN share_internal_instructions TINYINT(1) NOT NULL DEFAULT 0 AFTER internal_instructions,
  ADD COLUMN last_notified_at DATETIME NULL AFTER show_contact_in_portal,
  ADD COLUMN last_notified_snapshot_hash CHAR(64) NULL AFTER last_notified_at;

CREATE TABLE IF NOT EXISTS collaborator_notifications (
  id CHAR(36) PRIMARY KEY,
  assignment_id CHAR(36) NOT NULL,
  client_id CHAR(36) NOT NULL,
  collaborator_id CHAR(36) NOT NULL,
  idempotency_key CHAR(36) NOT NULL,
  recipient VARCHAR(320) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  rendered_html LONGTEXT NOT NULL,
  rendered_text LONGTEXT NOT NULL,
  disclosed_fee DECIMAL(10,2) NULL,
  attachments_json JSON NULL,
  source_snapshot_hash CHAR(64) NOT NULL,
  status ENUM('queued','sent','failed') NOT NULL DEFAULT 'queued',
  attempts INT NOT NULL DEFAULT 0,
  provider_message_id VARCHAR(500) NULL,
  failure_reason TEXT NULL,
  created_by VARCHAR(190) NOT NULL,
  sent_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_collab_notification_assignment FOREIGN KEY (assignment_id) REFERENCES client_team_assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_collab_notification_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_collab_notification_collaborator FOREIGN KEY (collaborator_id) REFERENCES collaborators(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_collab_notification_idempotency (idempotency_key),
  INDEX idx_collab_notification_assignment (assignment_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO app_migrations (migration_key,details)
VALUES ('031_collaborator_directory_and_notifications',JSON_OBJECT('scope','collaborator directory, richer wedding assignments and manual notification history'));
