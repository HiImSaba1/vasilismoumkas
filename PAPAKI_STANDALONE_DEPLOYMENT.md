# Papaki standalone deployment

This release changes only the Node.js runtime packaging. It does not migrate,
seed, export, or replace the production database. It never packages environment
files, credentials, private client files, or production-generated uploads.

## Build boundary

- Build only through Linux/WSL with Node.js 22.
- The artifact contains `start.js` plus `.next/standalone`.
- `public` is copied into `.next/standalone/public`.
- `.next/static` is copied into `.next/standalone/.next/static`.
- The source tree, full `.next`, build dependencies and private data are absent.
- A matching `.sha256` file is generated beside the tar archive.

Owner-run build:

```powershell
.\scripts\prepare-papaki-built-release.ps1 -ReleaseLabel standalone
```

When WSL is unavailable, push the secret-free source to the private GitHub
repository. The `Papaki standalone release` workflow builds on Ubuntu with
Node.js 22 and publishes the same `.tar.gz` plus `.sha256` pair under the
workflow run's **Artifacts** section. GitHub never receives production
environment files, database exports, private client files, local `.next`
folders, verification artifacts, or temporary release archives.

## Production layout

Use a new release directory. Do not extract over the current application:

```text
/var/www/vhosts/sabaweb.gr/vasilismoumkas-app/
├── incoming-YYYYMMDD-HHMMSS/
└── releases/
    └── release-YYYYMMDD-HHMMSS/
```

Keep the currently running application directory intact until the new release
passes every smoke test.

## Deployment gates

1. Upload the `.tar.gz` and matching `.sha256` into a new incoming directory.
2. Verify the checksum from that directory:

   ```bash
   sha256sum -c moumkas-papaki-standalone-*.tar.gz.sha256
   ```

3. Create a new versioned release directory and extract the tar there.
4. Confirm these paths exist:

   ```text
   start.js
   .next/standalone/server.js
   .next/standalone/.next/BUILD_ID
   .next/standalone/.next/server
   .next/standalone/.next/static
   .next/standalone/public
   ```

5. Copy the existing production `.env.production.local` into the new release
   root. Do not print or edit its values during deployment. Set mode `600`.
6. Preserve production-generated data before switching releases:
   - copy the existing private `storage/client-files` directory into
     `.next/standalone/storage/client-files`;
   - merge the existing production `public/uploads` into
     `.next/standalone/public/uploads` without deleting release assets.
7. Run the release verifier from the source checkout or CI artifact workspace.
8. Start the new release temporarily on an unused loopback port with its own
   process, then check `/` and `/api/health`. Stop that temporary process.
9. In Plesk update only this application:
   - Application root: the new versioned release directory
   - Document root: `.next/standalone/public`
   - Startup file: `start.js`
10. Restart only the Vasilis Node.js application once.
11. Verify HTTPS, admin login, one known offer, one known portal, the Greek PDF
    endpoint, public images, and one existing private file download.
12. Keep the old application directory unchanged until the owner confirms the
    production smoke test.

The private-file and upload copy in gate 6 is mandatory because those files are
not part of source control or release artifacts. The MySQL/MariaDB database is
external and must not be copied or imported during this runtime release.

## Runtime checks

After identifying the Vasilis process ID:

```bash
grep -oE '/[^ ]+\.node' "/proc/$VASILIS_PID/maps" | sort -u
```

The output must not contain an `@next/swc-linux-*` native module. Record the
process thread count only after the application has served a health request;
the expected improvement is approximately 8–9 threads, but the measured server
result is authoritative.

## Rollback

1. Restore the previous Plesk Application root, Document root and startup file.
2. Restart only the Vasilis application once.
3. Verify `/api/health` and the previously tested portal.
4. Do not delete the failed release until its logs and file paths are captured.
5. Do not restore or overwrite the database; this release makes no schema or
   data changes.
