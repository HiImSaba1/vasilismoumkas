ALTER TABLE leads MODIFY COLUMN status ENUM('new','awaiting-information','qualified','offer-draft','offer-sent','follow-up','accepted','lost','converted','completed') NOT NULL DEFAULT 'new';
ALTER TABLE onboarding MODIFY COLUMN production_status ENUM('not-started','event-complete','wedding-complete','editing','gallery-delivered') NOT NULL DEFAULT 'not-started';
