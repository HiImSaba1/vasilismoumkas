SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;
START TRANSACTION;

UPDATE automation_jobs SET template_id=NULL WHERE template_id IN ('006','007');
UPDATE email_deliveries SET template_id=NULL WHERE template_id IN ('006','007');
DELETE FROM email_templates WHERE id IN ('006','007');

UPDATE email_templates SET id=CONCAT('shift-',id) WHERE id IN ('008','009','010','011');
UPDATE automation_jobs SET template_id=CONCAT('shift-',template_id) WHERE template_id IN ('008','009','010','011');
UPDATE email_deliveries SET template_id=CONCAT('shift-',template_id) WHERE template_id IN ('008','009','010','011');

UPDATE email_templates SET id=LPAD(CAST(SUBSTRING(id,7) AS UNSIGNED)-2,3,'0') WHERE id LIKE 'shift-%';
UPDATE automation_jobs SET template_id=LPAD(CAST(SUBSTRING(template_id,7) AS UNSIGNED)-2,3,'0') WHERE template_id LIKE 'shift-%';
UPDATE email_deliveries SET template_id=LPAD(CAST(SUBSTRING(template_id,7) AS UNSIGNED)-2,3,'0') WHERE template_id LIKE 'shift-%';

COMMIT;
SET FOREIGN_KEY_CHECKS=1;
