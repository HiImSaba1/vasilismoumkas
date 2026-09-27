#!/usr/bin/env bash

set -Eeuo pipefail

release_label="${1:-standalone}"
if [[ ! "$release_label" =~ ^[a-z0-9][a-z0-9-]{0,31}$ ]]; then
  echo "Release label must use lowercase letters, numbers, and hyphens only." >&2
  exit 2
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source_root="$(cd -- "$script_dir/.." && pwd)"

# PowerShell starts a non-interactive WSL shell, so ~/.bashrc is not guaranteed
# to load a per-user NVM installation.
if ! command -v node >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck source=/dev/null
    source "$NVM_DIR/nvm.sh"
  fi
fi

node_major="$(node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null || true)"
if [[ -z "$node_major" || "$node_major" -lt 22 ]]; then
  echo "Node.js 22 or newer is required inside Linux/WSL." >&2
  exit 3
fi

for command_name in npm tar sha256sum find; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "$command_name is required inside Linux/WSL." >&2
    exit 3
  fi
done

timestamp="$(date -u +%Y%m%d-%H%M%S)"
work_root="$(mktemp -d "/tmp/moumkas-papaki-${release_label}-XXXXXX")"
build_root="$work_root/build"
release_root="$work_root/release"
standalone_root="$release_root/.next/standalone"
output_dir="$source_root/tmp"
archive_name="moumkas-papaki-standalone-${release_label}-${timestamp}.tar.gz"
archive_path="$output_dir/$archive_name"
checksum_path="$archive_path.sha256"

cleanup() {
  rm -rf -- "$work_root"
}
trap cleanup EXIT

mkdir -p -- "$build_root" "$standalone_root" "$output_dir"

echo "Copying a secret-free source snapshot into the Linux build workspace..."
tar \
  --exclude='./.git' \
  --exclude='./.github' \
  --exclude='./.next' \
  --exclude='./.next-*' \
  --exclude='./node_modules' \
  --exclude='./tmp' \
  --exclude='./artifacts' \
  --exclude='./storage/client-files' \
  --exclude='./playwright-report' \
  --exclude='./test-results' \
  --exclude='./.env' \
  --exclude='./.env.*' \
  --exclude='./npm-debug.log*' \
  -cf - -C "$source_root" . | tar -xf - -C "$build_root"

echo "Installing exact locked dependencies inside Linux..."
(
  cd -- "$build_root"
  npm ci --no-audit --no-fund
  npm run verify:standalone
)

echo "Creating the traced Next.js standalone production runtime..."
(
  cd -- "$build_root"
  export NODE_ENV=production
  export NEXT_DIST_DIR=.next
  export NEXT_TELEMETRY_DISABLED=1
  export NEXT_PUBLIC_SITE_URL=https://vasilismoumkas.com
  export UV_THREADPOOL_SIZE=1
  export NODE_OPTIONS="--max-old-space-size=2048"
  npm run build
)

required_build_paths=(
  ".next/standalone/server.js"
  ".next/standalone/.next/BUILD_ID"
  ".next/standalone/.next/server"
  ".next/standalone/.next/required-server-files.json"
  ".next/static"
  "public"
)

for required_path in "${required_build_paths[@]}"; do
  if [[ ! -e "$build_root/$required_path" ]]; then
    echo "Standalone build output is incomplete: missing $required_path" >&2
    exit 4
  fi
done

echo "Preparing the minimal Plesk release tree..."
cp -a -- "$build_root/.next/standalone/." "$standalone_root/"
mkdir -p -- "$standalone_root/.next/static" "$standalone_root/public"
cp -a -- "$build_root/.next/static/." "$standalone_root/.next/static/"
cp -a -- "$build_root/public/." "$standalone_root/public/"
cp -a -- "$build_root/start.js" "$release_root/start.js"

build_id="$(tr -d '\r\n' < "$standalone_root/.next/BUILD_ID")"

cat > "$release_root/PAPAKI_RELEASE_README.txt" <<EOF
VASILIS MOUMKAS PAPAKI STANDALONE RELEASE

Release: $release_label
Built UTC: $timestamp
Node: $(node --version)
Build ID: $build_id

This archive contains only the Plesk startup wrapper and the traced standalone
runtime. It intentionally contains no .env files, source tree, build toolchain,
database contents, private client uploads, local artifacts, or full .next build.

Read PAPAKI_STANDALONE_DEPLOYMENT.md in the source project before deployment.
Do not overwrite the active application directory and do not restart until the
new versioned release passes its temporary-port preflight.
EOF

cp -a -- "$build_root/PAPAKI_STANDALONE_DEPLOYMENT.md" "$release_root/PAPAKI_STANDALONE_DEPLOYMENT.md"

echo "Verifying the standalone runtime boundary..."
node "$build_root/scripts/verify-papaki-standalone-release.mjs" "$release_root"

swc_native="$(find "$standalone_root" -type f \( -path '*/@next/swc-*/*.node' -o -name 'next-swc*.node' \) -print -quit)"
if [[ -n "$swc_native" ]]; then
  echo "Standalone runtime unexpectedly contains an SWC native module: $swc_native" >&2
  exit 5
fi

echo "Packaging the minimal standalone runtime..."
tar -czf "$archive_path" -C "$release_root" .
(
  cd -- "$output_dir"
  sha256sum "$archive_name" > "${archive_name}.sha256"
)

echo
echo "Papaki standalone release created successfully:"
echo "$archive_path"
echo "Checksum: $checksum_path"
echo "Build ID: $build_id"
