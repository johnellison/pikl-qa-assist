#!/bin/bash

echo "🚀 Uploading Database to Railway"
echo "================================"
echo ""

# First, make sure railway is linked
railway status > /dev/null 2>&1 || {
    echo "Please run: railway link"
    exit 1
}

echo "Creating base64 encoded database..."
base64 data/db/qa-assist.db > /tmp/db-base64.txt

echo "Uploading to Railway..."
railway shell <<'UPLOAD_SCRIPT'
# Decode and save database
base64 -d > /app/data/db/qa-assist.db <<'EOF'
UPLOAD_SCRIPT

cat /tmp/db-base64.txt

railway shell <<'UPLOAD_SCRIPT_END'
EOF

# Verify
echo "Database uploaded! Checking record count..."
sqlite3 /app/data/db/qa-assist.db "SELECT COUNT(*) FROM Call;"
exit
UPLOAD_SCRIPT_END

rm /tmp/db-base64.txt
echo "✅ Done!"
