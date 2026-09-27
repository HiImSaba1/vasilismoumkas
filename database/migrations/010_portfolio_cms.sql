CREATE TABLE IF NOT EXISTS portfolio_projects (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(190) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  date_shot DATE NULL,
  client_name VARCHAR(255) NULL,
  location VARCHAR(255) NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Wedding',
  tags JSON NOT NULL,
  header_image VARCHAR(700) NOT NULL,
  is_new TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_portfolio_order (is_new, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_images (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  image_path VARCHAR(700) NOT NULL,
  alt_text VARCHAR(500) NOT NULL,
  width INT UNSIGNED NOT NULL DEFAULT 1600,
  height INT UNSIGNED NOT NULL DEFAULT 1200,
  position TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_portfolio_image_project FOREIGN KEY (project_id) REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  UNIQUE KEY uq_portfolio_position (project_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
