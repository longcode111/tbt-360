#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "${project_root}/.env" ]]; then
  echo "Thiếu .env. Hãy chạy: cp .env.example .env"
  exit 1
fi

set -a
source "${project_root}/.env"
set +a

export ConnectionStrings__Postgres="Host=127.0.0.1;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}"

cd "${project_root}/backend/Tbt360.Api"
dotnet run --launch-profile http
