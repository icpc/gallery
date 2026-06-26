#!/usr/bin/env bash
# Convenience launcher. Creates a venv, installs deps, imports suggestions (if a
# file is given), and starts the web app at http://127.0.0.1:5057
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -r requirements.txt

if [ "${1:-}" != "" ]; then
  python scripts/import_suggestions.py "$1"
fi

python scripts/make_sample_image.py >/dev/null 2>&1 || true
echo "Starting reviewer at http://127.0.0.1:${PORT:-5057}"
python -m reviewer.app
