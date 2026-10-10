ALTER TABLE automation_jobs
  ADD COLUMN send_mode ENUM('automatic','manual') NOT NULL DEFAULT 'automatic' AFTER template_id,
  ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'Europe/Athens' AFTER scheduled_for;

UPDATE automation_jobs
SET status='cancelled',completed_at=CURRENT_TIMESTAMP,
    last_error='Cancelled by migration 025: Template 007 is post-event, not booking confirmation'
WHERE job_type='booking-confirmation' AND template_id='007' AND status IN ('scheduled','failed');

INSERT INTO automation_jobs
  (id,job_key,job_type,client_id,offer_id,template_id,send_mode,scheduled_for,timezone,payload)
SELECT UUID(),CONCAT('client:',c.id,':post-event-thank-you'),'post-event-thank-you',c.id,c.accepted_offer_id,'007','automatic',
       DATE_ADD(c.event_date,INTERVAL 1 DAY),'Europe/Athens',JSON_OBJECT('source','migration-025-repair')
FROM clients c JOIN onboarding o ON o.client_id=c.id
WHERE o.booking_status='confirmed' AND c.event_date IS NOT NULL
ON DUPLICATE KEY UPDATE
  scheduled_for=IF(status IN ('scheduled','failed'),VALUES(scheduled_for),scheduled_for),
  preview_notified_at=IF(status IN ('scheduled','failed'),NULL,preview_notified_at);

UPDATE automation_jobs j JOIN clients c ON c.id=j.client_id
SET j.scheduled_for=DATE_SUB(c.event_date,INTERVAL 60 DAY),j.preview_notified_at=NULL,
    j.last_error='Reconciled by migration 025 to 60 days before the event'
WHERE j.template_id='009' AND j.status IN ('scheduled','failed') AND j.send_mode='automatic' AND c.event_date IS NOT NULL;

ALTER TABLE google_calendar_events
  MODIFY COLUMN google_event_id VARCHAR(255) NULL,
  ADD COLUMN sync_status ENUM('pending','synced','failed') NOT NULL DEFAULT 'pending' AFTER google_event_id,
  ADD COLUMN last_error TEXT NULL AFTER sync_status,
  ADD COLUMN last_attempt_at DATETIME NULL AFTER last_error;

UPDATE email_templates
SET purpose='Post-event thank-you',
    trigger_description='Automatic only on the day after the recorded event date. Never use as a booking confirmation.'
WHERE id='007';

UPDATE email_templates
SET trigger_description='Automatic 60 days before the recorded event date. Rescheduled when the event date changes.'
WHERE id='009';
