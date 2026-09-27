ALTER TABLE offers
  MODIFY COLUMN status ENUM('draft','sent','viewed','accepted','rejected','expired','revoked') NOT NULL DEFAULT 'draft';
