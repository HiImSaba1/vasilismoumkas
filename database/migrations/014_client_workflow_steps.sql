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
