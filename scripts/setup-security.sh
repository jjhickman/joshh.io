#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRECOMMIT_HOOK="${ROOT_DIR}/.husky/pre-commit"

echo "Setting up security workflow..."

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but was not found."
  exit 1
fi

echo "Installing Husky hooks..."
npm run prepare >/dev/null

if [[ ! -f "${PRECOMMIT_HOOK}" ]]; then
  cat > "${PRECOMMIT_HOOK}" <<'EOF'
#!/usr/bin/env sh
npm run audit:secrets:staged
EOF
  echo "Created .husky/pre-commit hook."
fi

chmod +x "${PRECOMMIT_HOOK}"

if command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks found: $(gitleaks version | head -n 1)"
  echo "Security workflow is ready."
  exit 0
fi

echo "gitleaks is not installed."
echo "Install gitleaks, then re-run: npm run setup:security"
echo "Install guide: https://github.com/gitleaks/gitleaks#installing"
exit 1
