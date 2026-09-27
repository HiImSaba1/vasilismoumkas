ALTER TABLE email_deliveries
  ADD COLUMN idempotency_key VARCHAR(64) NULL AFTER rendered_subject,
  ADD UNIQUE INDEX uq_deliveries_idempotency (idempotency_key);
