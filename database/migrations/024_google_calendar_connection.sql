CREATE TABLE IF NOT EXISTS google_calendar_connections (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  account_email VARCHAR(320) NOT NULL,
  calendar_id VARCHAR(255) NOT NULL DEFAULT 'primary',
  refresh_token_ciphertext TEXT NOT NULL,
  refresh_token_iv VARCHAR(64) NOT NULL,
  refresh_token_tag VARCHAR(64) NOT NULL,
  scope TEXT NULL,
  connected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_sync_at DATETIME NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS google_calendar_events (
  client_id CHAR(36) NOT NULL PRIMARY KEY,
  google_event_id VARCHAR(255) NOT NULL,
  synced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_google_calendar_event_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE KEY uq_google_calendar_event_id (google_event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
