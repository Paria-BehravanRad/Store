#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:4000}"

echo "==> Health"
curl -fsS "$API_URL/api/health" | tee /tmp/vp-health.json
echo

echo "==> Public settings"
curl -fsS "$API_URL/api/settings/public" | tee /tmp/vp-settings.json
echo

echo "==> Catalog"
curl -fsS "$API_URL/api/products?pageSize=2" | tee /tmp/vp-products.json
echo

echo "==> OTP request (mock)"
OTP_JSON=$(curl -fsS -X POST "$API_URL/api/auth/otp/request" \
  -H 'content-type: application/json' \
  -d '{"phone":"09123334455"}')
echo "$OTP_JSON" | tee /tmp/vp-otp.json
CODE=$(node -e "const j=JSON.parse(process.argv[1]); if(!j.debugCode) process.exit(2); process.stdout.write(j.debugCode)" "$OTP_JSON")

echo "==> OTP verify"
curl -fsS -X POST "$API_URL/api/auth/otp/verify" \
  -H 'content-type: application/json' \
  -c /tmp/vp-cookies.txt \
  -d "{\"phone\":\"09123334455\",\"code\":\"$CODE\"}" | tee /tmp/vp-verify.json
echo

echo "Smoke checks passed."
