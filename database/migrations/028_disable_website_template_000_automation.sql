-- Sprint 48: website inquiries require an explicit CRM review before Template 000.
-- Cancel only pending automatic acknowledgements created by the legacy public-form flow.
UPDATE automation_jobs
SET
    status = 'cancelled',
    completed_at = CURRENT_TIMESTAMP,
    last_error = 'Cancelled: website Template 000 now requires explicit CRM send',
    locked_at = NULL
WHERE template_id = '000'
  AND send_mode = 'automatic'
  AND job_type = 'lead-acknowledgement'
  AND status IN ('scheduled', 'failed', 'processing')
  AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.source')) = 'website-inquiry';
