-- One-time evidence repair for the confirmed Ioannis Giapavlos delivery.
-- This migration changes CRM metadata only. It never sends an email.

UPDATE email_deliveries d
JOIN (
  SELECT id
  FROM email_deliveries
  WHERE lead_id='b5a6ff7d-1c60-4b40-9d59-433a7a50b0ac'
    AND template_id='000'
    AND status='sent'
    AND rendered_subject LIKE '%προσωπική σας πρόταση φωτογράφισης%'
  ORDER BY COALESCE(sent_at,created_at) DESC
  LIMIT 1
) target ON target.id=d.id
SET d.template_id='001',
    d.offer_id=COALESCE(d.offer_id,(
      SELECT o.id FROM offers o
      WHERE o.lead_id=d.lead_id
      ORDER BY o.created_at DESC LIMIT 1
    ));

UPDATE offers o
JOIN (
  SELECT offer_id,MIN(sent_at) first_sent_at
  FROM email_deliveries
  WHERE lead_id='b5a6ff7d-1c60-4b40-9d59-433a7a50b0ac'
    AND template_id='001' AND status='sent' AND offer_id IS NOT NULL
  GROUP BY offer_id
) delivered ON delivered.offer_id=o.id
SET o.status=IF(o.status='draft','sent',o.status),
    o.sent_at=COALESCE(o.sent_at,delivered.first_sent_at),
    o.expires_at=COALESCE(o.expires_at,DATE_ADD(delivered.first_sent_at,INTERVAL 30 DAY));

UPDATE leads l
SET l.status=IF(l.status IN ('new','awaiting-information','qualified','offer-draft'),'offer-sent',l.status)
WHERE l.id='b5a6ff7d-1c60-4b40-9d59-433a7a50b0ac'
  AND EXISTS (
    SELECT 1 FROM email_deliveries d
    WHERE d.lead_id=l.id AND d.template_id='001' AND d.status='sent'
  );

UPDATE automation_jobs
SET status='cancelled',completed_at=CURRENT_TIMESTAMP,locked_at=NULL,
    last_error='Cancelled by migration 026: Template 001 was already delivered and its evidence was repaired'
WHERE lead_id='b5a6ff7d-1c60-4b40-9d59-433a7a50b0ac'
  AND template_id='001' AND status IN ('scheduled','failed','processing');

INSERT INTO automation_jobs
  (id,job_key,job_type,lead_id,offer_id,template_id,send_mode,scheduled_for,timezone,payload)
SELECT UUID(),CONCAT('offer:',o.id,':followup:6'),'offer-followup',o.lead_id,o.id,'002','automatic',
       DATE_ADD(o.sent_at,INTERVAL 6 DAY),'Europe/Athens',JSON_OBJECT('day',6,'source','migration-026-evidence-repair')
FROM offers o
WHERE o.lead_id='b5a6ff7d-1c60-4b40-9d59-433a7a50b0ac'
  AND o.status IN ('sent','viewed') AND o.sent_at IS NOT NULL
ON DUPLICATE KEY UPDATE
  scheduled_for=IF(status IN ('scheduled','failed'),VALUES(scheduled_for),scheduled_for),
  preview_notified_at=IF(status IN ('scheduled','failed'),NULL,preview_notified_at);

INSERT INTO automation_jobs
  (id,job_key,job_type,lead_id,offer_id,template_id,send_mode,scheduled_for,timezone,payload)
SELECT UUID(),CONCAT('offer:',o.id,':followup:10'),'offer-followup',o.lead_id,o.id,'003','automatic',
       DATE_ADD(o.sent_at,INTERVAL 10 DAY),'Europe/Athens',JSON_OBJECT('day',10,'source','migration-026-evidence-repair')
FROM offers o
WHERE o.lead_id='b5a6ff7d-1c60-4b40-9d59-433a7a50b0ac'
  AND o.status IN ('sent','viewed') AND o.sent_at IS NOT NULL
ON DUPLICATE KEY UPDATE
  scheduled_for=IF(status IN ('scheduled','failed'),VALUES(scheduled_for),scheduled_for),
  preview_notified_at=IF(status IN ('scheduled','failed'),NULL,preview_notified_at);

INSERT INTO activity_log (lead_id,event_type,summary,metadata)
SELECT 'b5a6ff7d-1c60-4b40-9d59-433a7a50b0ac','email-evidence-repaired',
       'Template 001 delivery metadata reconciled without resending email',
       JSON_OBJECT('migration','026','resend',FALSE)
WHERE EXISTS (
  SELECT 1 FROM email_deliveries
  WHERE lead_id='b5a6ff7d-1c60-4b40-9d59-433a7a50b0ac'
    AND template_id='001' AND status='sent'
)
AND NOT EXISTS (
  SELECT 1 FROM activity_log
  WHERE lead_id='b5a6ff7d-1c60-4b40-9d59-433a7a50b0ac'
    AND event_type='email-evidence-repaired'
    AND JSON_UNQUOTE(JSON_EXTRACT(metadata,'$.migration'))='026'
);
