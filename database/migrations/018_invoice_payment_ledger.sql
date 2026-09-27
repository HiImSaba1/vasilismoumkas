ALTER TABLE onboarding
  MODIFY COLUMN invoice_status ENUM('not-issued','issued','part-paid','paid') NOT NULL DEFAULT 'not-issued';

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
