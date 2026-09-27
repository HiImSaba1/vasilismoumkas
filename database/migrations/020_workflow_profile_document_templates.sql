ALTER TABLE leads
  ADD COLUMN workflow_locale ENUM('el','en') NULL AFTER event_type;

CREATE TABLE IF NOT EXISTS document_templates (
  id CHAR(36) PRIMARY KEY,
  template_key VARCHAR(80) NOT NULL UNIQUE,
  document_type ENUM('questionnaire','contract','invoice') NOT NULL,
  event_type ENUM('wedding','baptism') NOT NULL,
  locale ENUM('el','en') NOT NULL,
  name VARCHAR(255) NOT NULL,
  content JSON NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_document_template_scope (event_type,locale,document_type,is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO document_templates (id,template_key,document_type,event_type,locale,name,content)
VALUES
(UUID(),'wedding-el-questionnaire','questionnaire','wedding','el','Wedding GR · Questionnaire',JSON_OBJECT('instructions','Συμπληρώστε τις πληροφορίες και τις λεπτομέρειες της ημέρας του γάμου σας.')),
(UUID(),'wedding-en-questionnaire','questionnaire','wedding','en','Wedding EN · Questionnaire',JSON_OBJECT('instructions','Please complete the details and schedule for your wedding day.')),
(UUID(),'baptism-el-questionnaire','questionnaire','baptism','el','Baptism GR · Questionnaire',JSON_OBJECT('instructions','Συμπληρώστε τις πληροφορίες και τις λεπτομέρειες της ημέρας της βάπτισης.')),
(UUID(),'baptism-en-questionnaire','questionnaire','baptism','en','Baptism EN · Questionnaire',JSON_OBJECT('instructions','Please complete the details and schedule for the baptism day.')),
(UUID(),'wedding-el-contract','contract','wedding','el','Wedding GR · Contract',JSON_OBJECT()),
(UUID(),'wedding-en-contract','contract','wedding','en','Wedding EN · Contract',JSON_OBJECT()),
(UUID(),'baptism-el-contract','contract','baptism','el','Baptism GR · Contract',JSON_OBJECT()),
(UUID(),'baptism-en-contract','contract','baptism','en','Baptism EN · Contract',JSON_OBJECT()),
(UUID(),'wedding-el-invoice','invoice','wedding','el','Wedding GR · Invoice',JSON_OBJECT()),
(UUID(),'wedding-en-invoice','invoice','wedding','en','Wedding EN · Invoice',JSON_OBJECT()),
(UUID(),'baptism-el-invoice','invoice','baptism','el','Baptism GR · Invoice',JSON_OBJECT()),
(UUID(),'baptism-en-invoice','invoice','baptism','en','Baptism EN · Invoice',JSON_OBJECT())
ON DUPLICATE KEY UPDATE name=VALUES(name);
