#!/bin/bash

# Upload database to production via API endpoint

echo "🚀 Uploading Database to Production"
echo "===================================="
echo ""

# Get Railway URL from user
read -p "Enter your Railway URL (e.g., https://pikl-qa-assist-production.up.railway.app): " RAILWAY_URL

# Remove trailing slash if present
RAILWAY_URL=${RAILWAY_URL%/}

echo ""
echo "Creating database dump..."
sqlite3 data/db/qa-assist.db .dump > data-backup.sql
CALL_COUNT=$(sqlite3 data/db/qa-assist.db "SELECT COUNT(*) FROM Call;")
echo "✅ Created dump with $CALL_COUNT calls"
echo ""

echo "Uploading to $RAILWAY_URL..."
echo "Password: Pikl what you love 2025!"
echo ""

# Upload using curl
response=$(curl -s -X POST \
  -F "password=Pikl what you love 2025!" \
  -F "sqlDump=@data-backup.sql" \
  "$RAILWAY_URL/api/admin/import-db")

echo "Response: $response"
echo ""

# Check if successful
if echo "$response" | grep -q '"success":true'; then
    echo "✅ Database imported successfully!"
    echo "🎉 Your calls are now in production!"
else
    echo "❌ Import failed. Check the error message above."
    exit 1
fi
