#!/usr/bin/env bash
set -euo pipefail

# Keep runtime credentials in an ignored .env file. This deliberately checks
# tracked source only; historical credential rotation is documented separately.
forbidden='-----BEGIN( [A-Z]+)? PRIVATE KEY-----|AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16}|sk-(proj-)?[A-Za-z0-9_-]{20,}'

if git grep -nE -e "$forbidden" -- ':!*.lock' ':!SECURITY_RELEASE.md'; then
  echo "Tracked credential-like content found. Remove it and use .env instead." >&2
  exit 1
fi

if git grep -nE -e '^OPENAI_API_KEY=.+$' -- '.env.example'; then
  echo ".env.example must keep OPENAI_API_KEY empty." >&2
  exit 1
fi
