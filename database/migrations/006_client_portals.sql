SET NAMES utf8mb4;
CREATE TABLE IF NOT EXISTS client_portals (
  id CHAR(36) PRIMARY KEY,
  client_id CHAR(36) NOT NULL UNIQUE,
  public_slug VARCHAR(190) NOT NULL UNIQUE,
  status ENUM('active','revoked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_client_portal_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO client_portals (id,client_id,public_slug)
SELECT UUID(),c.id,CONCAT(COALESCE(o.slug,'client'),'-portal-',SUBSTRING(REPLACE(UUID(),'-',''),1,12))
FROM clients c LEFT JOIN offers o ON o.id=c.accepted_offer_id;

INSERT IGNORE INTO lead_document_records (id,lead_id,document_type,template_key,status,document_data)
SELECT UUID(),c.lead_id,t.document_type,t.template_key,'draft',JSON_OBJECT()
FROM clients c JOIN (
  SELECT 'questionnaire' document_type,'wedding-planning' template_key UNION ALL
  SELECT 'contract','greek-wedding-agreement' UNION ALL
  SELECT 'invoice','wedding-invoice'
) t WHERE c.lead_id IS NOT NULL;
