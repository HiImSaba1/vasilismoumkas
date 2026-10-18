ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) NULL AFTER description,
  ADD COLUMN IF NOT EXISTS meta_description VARCHAR(500) NULL AFTER seo_title,
  ADD COLUMN IF NOT EXISTS header_image_alt VARCHAR(500) NULL AFTER header_image,
  ADD COLUMN IF NOT EXISTS is_published TINYINT(1) NOT NULL DEFAULT 1 AFTER is_new;

UPDATE portfolio_projects
SET seo_title='Spinalonga Wedding in Crete — Angeliki & Victor | Vasilis Moumkas',
    meta_description='Angeliki and Victor’s wedding on Spinalonga, with island portraits and a reception at Elounda Beach Hotel & Villas. Photography by Vasilis Moumkas.'
WHERE slug='angeliki-victor';

UPDATE portfolio_projects
SET seo_title='Ktima Deda Wedding & Lake Como Portraits | Vasilis Moumkas',
    meta_description='Katerina and Stefanos’s wedding at Ktima Deda in Thessaloniki, followed by next-day portraits at Lake Como. Photography by Vasilis Moumkas.'
WHERE slug='katerina-stefanos';
