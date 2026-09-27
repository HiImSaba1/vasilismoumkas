ALTER TABLE document_templates
  ADD COLUMN is_default TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active;

UPDATE document_templates
SET is_default=1
WHERE template_key IN (
  'wedding-el-questionnaire','wedding-el-contract','wedding-el-invoice',
  'wedding-en-questionnaire','wedding-en-contract','wedding-en-invoice',
  'baptism-el-questionnaire','baptism-el-contract','baptism-el-invoice',
  'baptism-en-questionnaire','baptism-en-contract','baptism-en-invoice'
);

DROP TRIGGER IF EXISTS trg_lead_document_workflow_profile;

DELIMITER $$
CREATE TRIGGER trg_lead_document_workflow_profile
BEFORE INSERT ON lead_document_records
FOR EACH ROW
BEGIN
  DECLARE profile_event VARCHAR(20);
  DECLARE profile_locale VARCHAR(2);
  DECLARE selected_key VARCHAR(80);
  DECLARE selected_content JSON;

  SELECT event_type,workflow_locale
    INTO profile_event,profile_locale
  FROM leads
  WHERE id=NEW.lead_id
  LIMIT 1;

  IF profile_locale IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Choose the lead workflow profile before provisioning documents';
  END IF;

  SELECT template_key,content
    INTO selected_key,selected_content
  FROM document_templates
  WHERE BINARY event_type=BINARY profile_event
    AND BINARY locale=BINARY profile_locale
    AND BINARY document_type=BINARY NEW.document_type
    AND is_active=1
  ORDER BY is_default DESC,updated_at DESC
  LIMIT 1;

  IF selected_key IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='No active document template exists for this workflow profile';
  END IF;

  SET NEW.template_key=selected_key;
  IF NEW.document_type='contract' AND profile_event='baptism' THEN
    SET NEW.document_data=JSON_MERGE_PATCH(selected_content,JSON_OBJECT('language',profile_locale));
  ELSE
    SET NEW.document_data=JSON_MERGE_PATCH(selected_content,NEW.document_data);
  END IF;
END$$
DELIMITER ;

UPDATE lead_document_records d
JOIN leads l ON l.id=d.lead_id
JOIN document_templates t ON BINARY t.event_type=BINARY l.event_type
  AND BINARY t.locale=BINARY l.workflow_locale
  AND BINARY t.document_type=BINARY d.document_type
  AND t.is_active=1
  AND t.is_default=1
SET d.template_key=t.template_key,
    d.document_data=CASE
      WHEN d.document_type='contract' AND l.event_type='baptism'
        THEN JSON_MERGE_PATCH(t.content,JSON_OBJECT('language',l.workflow_locale))
      ELSE JSON_MERGE_PATCH(t.content,d.document_data)
    END;
