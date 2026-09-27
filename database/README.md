# Moumkas CRM database setup

MySQL is the production source of truth. The JSON files are retained only until migration, record-count comparison, backup, and restore testing have all passed.

1. Create a UTF-8 database and a dedicated application user in Papaki.
2. Grant the application user only `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on this database.
3. Import `database/schema.sql` through phpMyAdmin.
4. Configure the variables documented in `.env.example` in the Node.js application environment.
5. Run `npm run db:check-schema`, then `npm run db:import-json` once.
6. Compare table counts and public offer/timeline rendering before enabling production writes.

Do not use the MySQL root account from Next.js. Do not place credentials in source files or deployment archives.
