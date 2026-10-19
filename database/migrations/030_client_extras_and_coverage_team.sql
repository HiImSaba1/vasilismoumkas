CREATE TABLE IF NOT EXISTS extra_service_catalog (
  catalog_key VARCHAR(80) PRIMARY KEY,
  title_el VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_el TEXT NULL,
  description_en TEXT NULL,
  default_unit_price DECIMAL(10,2) NOT NULL,
  requires_scope TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO extra_service_catalog
  (catalog_key,title_el,title_en,description_el,description_en,default_unit_price,requires_scope)
VALUES
  ('extra-coverage-hour','Επιπλέον ώρα κάλυψης','Additional coverage hour','Το ακριβές πεδίο κάλυψης ορίζεται ανά πελάτη.','The exact coverage scope is defined per client.',150.00,1),
  ('large-album','Μεγάλο άλμπουμ','Large album',NULL,NULL,300.00,0),
  ('small-album','Μικρό άλμπουμ','Small album',NULL,NULL,100.00,0)
ON DUPLICATE KEY UPDATE catalog_key=VALUES(catalog_key);

CREATE TABLE IF NOT EXISTS client_extra_services (
  id CHAR(36) PRIMARY KEY,
  client_id CHAR(36) NOT NULL,
  catalog_key VARCHAR(80) NULL,
  title_el VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_el TEXT NULL,
  description_en TEXT NULL,
  coverage_scope VARCHAR(500) NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(10,2) NOT NULL,
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 24.00,
  price_includes_vat TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('proposed','agreed','cancelled') NOT NULL DEFAULT 'proposed',
  show_in_portal TINYINT(1) NOT NULL DEFAULT 0,
  internal_note TEXT NULL,
  document_update_required TINYINT(1) NOT NULL DEFAULT 0,
  cancelled_at DATETIME NULL,
  created_by VARCHAR(190) NOT NULL,
  updated_by VARCHAR(190) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_client_extra_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_client_extra_catalog FOREIGN KEY (catalog_key) REFERENCES extra_service_catalog(catalog_key) ON DELETE SET NULL,
  CONSTRAINT chk_client_extra_quantity CHECK (quantity > 0),
  CONSTRAINT chk_client_extra_price CHECK (unit_price >= 0),
  INDEX idx_client_extra_status (client_id,status,show_in_portal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collaborators (
  id CHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NULL,
  phone VARCHAR(60) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_collaborator_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS client_team_assignments (
  id CHAR(36) PRIMARY KEY,
  client_id CHAR(36) NOT NULL,
  collaborator_id CHAR(36) NOT NULL,
  role ENUM('lead-photographer','second-photographer','lead-videographer','second-videographer','custom') NOT NULL,
  custom_role VARCHAR(255) NULL,
  status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  coverage_start TIME NULL,
  coverage_end TIME NULL,
  meeting_point VARCHAR(500) NULL,
  internal_instructions TEXT NULL,
  fee DECIMAL(10,2) NULL,
  show_name_in_portal TINYINT(1) NOT NULL DEFAULT 0,
  show_contact_in_portal TINYINT(1) NOT NULL DEFAULT 0,
  cancelled_at DATETIME NULL,
  created_by VARCHAR(190) NOT NULL,
  updated_by VARCHAR(190) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_team_assignment_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_assignment_collaborator FOREIGN KEY (collaborator_id) REFERENCES collaborators(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_client_collaborator_role (client_id,collaborator_id,role),
  INDEX idx_team_assignment_status (client_id,status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO app_migrations (migration_key,details)
VALUES ('030_client_extras_and_coverage_team',JSON_OBJECT('scope','client extras, financial snapshot and coverage team'));
