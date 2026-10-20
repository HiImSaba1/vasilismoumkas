ALTER TABLE collaborator_notifications
  ADD COLUMN cc_recipient VARCHAR(320) NULL AFTER recipient;

INSERT IGNORE INTO app_migrations (migration_key,details)
VALUES ('032_collaborator_notification_cc',JSON_OBJECT('scope','owner CC and audit trail for manual collaborator notifications'));
