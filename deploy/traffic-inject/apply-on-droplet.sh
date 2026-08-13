#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR=/opt/traffic-inject
ENV_FILE=/etc/traffic-dashboard/traffic-dashboard.env
ORIGINS="http://142.93.61.217,http://142.93.61.217:8080,http://142.93.61.217:8083,http://142.93.61.217:8084,http://142.93.61.217:8085,http://142.93.61.217:8086,http://127.0.0.1:3000,http://127.0.0.1:5000,http://localhost:3000,http://localhost:5000"

echo "==> Installing traffic inject preload"
mkdir -p "${INSTALL_DIR}"
install -m 0644 /tmp/traffic-preload.js "${INSTALL_DIR}/preload.js"

echo "==> Updating traffic dashboard tabs (idempotent)"
python3 <<'PY'
from pathlib import Path
p = Path("/opt/traffic-dashboard/public/dashboard.html")
text = p.read_text()
tabs = [
    ("lucent-diamond-matcher", "Lucent Diamond Matcher"),
    ("northline-agency", "Northline Agency"),
    ("ist-website-v0.6", "IST Website"),
]
for site, label in tabs:
    tab = f'        <button class="tab" data-site="{site}">{label}</button>'
    if tab not in text:
        anchor = '        <button class="tab" data-site="comfort-mobility">Comfort Mobility</button>'
        text = text.replace(anchor, anchor + "\n" + tab, 1)
    key = f'        "{site}": "{label}",'
    if key not in text:
        anchor = '        "comfort-mobility": "Comfort Mobility",'
        text = text.replace(anchor, anchor + "\n" + key, 1)
p.write_text(text)
print("dashboard.html ok")
PY

echo "==> Updating ALLOWED_ORIGINS"
if grep -q '^ALLOWED_ORIGINS=' "${ENV_FILE}"; then
  sed -i "s|^ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=${ORIGINS}|" "${ENV_FILE}"
else
  echo "ALLOWED_ORIGINS=${ORIGINS}" >> "${ENV_FILE}"
fi

MOB_ENV=/opt/mobility-website/.env
if [[ -f "${MOB_ENV}" ]]; then
  if grep -q '^NEXT_PUBLIC_TRAFFIC_ENDPOINT=' "${MOB_ENV}"; then
    sed -i 's|^NEXT_PUBLIC_TRAFFIC_ENDPOINT=.*|NEXT_PUBLIC_TRAFFIC_ENDPOINT=http://142.93.61.217:8082/api/collect|' "${MOB_ENV}"
  else
    echo 'NEXT_PUBLIC_TRAFFIC_ENDPOINT=http://142.93.61.217:8082/api/collect' >> "${MOB_ENV}"
  fi
fi

patch_service() {
  local unit="$1"
  unit="${unit%.service}"
  local file="/etc/systemd/system/${unit}.service"
  [[ -f "${file}" ]] || return 0

  if grep -q '^ExecStart=/usr/bin/env NODE_OPTIONS=' "${file}"; then
    sed -i 's|^ExecStart=/usr/bin/env NODE_OPTIONS=.* /usr/bin/npm |ExecStart=/usr/bin/npm |' "${file}"
  fi
  if grep -q '^Environment=NODE_OPTIONS=--require /opt/traffic-inject/preload.js$' "${file}"; then
    sed -i 's|^Environment=NODE_OPTIONS=--require /opt/traffic-inject/preload.js$|Environment="NODE_OPTIONS=--require /opt/traffic-inject/preload.js"|' "${file}"
    echo "fixed ${unit} NODE_OPTIONS quoting"
    return 0
  fi

  if grep -q '^ExecStart=/usr/bin/npm ' "${file}"; then
    if ! grep -q 'traffic-inject/preload.js' "${file}"; then
      if [[ "${unit}" == "northline-agency" ]]; then
        cat > "${file}" <<'UNITEOF'
[Unit]
Description=Northline agency Next.js website
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=northline
Group=northline
WorkingDirectory=/opt/northline-agency
EnvironmentFile=/opt/northline-agency/apps/agency/.env
Environment=NODE_ENV=production
Environment=PORT=3005
Environment=HOSTNAME=127.0.0.1
Environment="NODE_OPTIONS=--require /opt/traffic-inject/preload.js"
ExecStart=/usr/bin/npm run start -w agency
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ReadWritePaths=/opt/northline-agency/apps/agency/prisma /var/log/northline-agency

[Install]
WantedBy=multi-user.target
UNITEOF
      else
        sed -i '/^Environment=PORT=/a Environment="NODE_OPTIONS=--require /opt/traffic-inject/preload.js"' "${file}"
      fi
      echo "patched ${unit} (npm NODE_OPTIONS)"
    else
      echo "${unit} already patched"
    fi
    return 0
  fi

  if grep -q 'traffic-inject/preload.js' "${file}"; then
    echo "${unit} already patched"
    return 0
  fi

  if grep -q '^ExecStart=/usr/bin/node ' "${file}"; then
    sed -i 's|^ExecStart=/usr/bin/node |ExecStart=/usr/bin/node --require /opt/traffic-inject/preload.js |' "${file}"
    echo "patched ${unit}"
    return 0
  fi

  echo "WARN: could not patch ExecStart in ${unit}" >&2
}

patch_service mobility-website.service
patch_service lucent-diamond-matcher.service
patch_service northline-agency.service
patch_service ist-website-v0.6.service

systemctl daemon-reload
systemctl restart traffic-dashboard.service
systemctl restart mobility-website.service lucent-diamond-matcher.service northline-agency.service ist-website-v0.6.service

sleep 10
for port in 8083 8084 8085 8086; do
  echo "=== check :${port} ==="
  if curl -s --max-time 20 -H 'Accept-Encoding: identity' "http://127.0.0.1:${port}/" | head -c 12000 | grep -q '__TRAFFIC_SITE__'; then
    echo "OK tracker injected"
  else
    echo "MISSING tracker on :${port}"
    exit 1
  fi
done

curl -s -o /dev/null -w "collect:%{http_code}\n" -X POST http://127.0.0.1:3002/api/collect \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://142.93.61.217:8086' \
  -d '{"site":"ist-website-v0.6","sessionId":"test-ist","event":"pageview","path":"/","title":"Test"}'

echo "TRAFFIC_SITES_OK"
