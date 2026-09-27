ALTER TABLE automation_jobs
  ADD COLUMN preview_notified_at DATETIME NULL AFTER completed_at;

CREATE INDEX idx_jobs_preview
  ON automation_jobs (status, preview_notified_at, scheduled_for);
