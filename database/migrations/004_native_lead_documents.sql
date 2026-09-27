SET NAMES utf8mb4;
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
