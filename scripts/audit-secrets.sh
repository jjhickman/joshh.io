#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_PATH="${ROOT_DIR}/.gitleaks.toml"
MODE="${1:-full}"

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "Error: gitleaks is not installed."
  echo "Install: https://github.com/gitleaks/gitleaks#installing"
  exit 1
fi

if [[ ! -f "${CONFIG_PATH}" ]]; then
  echo "Error: missing gitleaks config at ${CONFIG_PATH}"
  exit 1
fi

if [[ "${MODE}" == "--staged" ]]; then
  echo "Running staged secret scan (gitleaks protect --staged)..."
  gitleaks protect --staged --redact --verbose --config "${CONFIG_PATH}"
  exit 0
fi

if [[ "${MODE}" != "full" ]]; then
  echo "Unknown argument: ${MODE}"
  echo "Usage: npm run audit:secrets [-- --staged]"
  exit 1
fi

echo "Running full secret scan (gitleaks detect)..."
gitleaks detect --source "${ROOT_DIR}" --redact --verbose --config "${CONFIG_PATH}"
