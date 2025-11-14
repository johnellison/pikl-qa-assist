#!/bin/bash

# Pikl QA Assist - Railway Database Upload Script
# This uploads your local database directly to Railway's persistent volume

set -e

echo "🚀 Pikl QA Assist - Railway Database Upload"
echo "==========================================="
echo ""

# Check if railway is linked
echo "🔗 Checking Railway connection..."
railway status > /dev/null 2>&1 || {
    echo "❌ Not linked to Railway project"
    echo "Please run: railway link"
    exit 1
}
echo "✅ Connected to Railway"
echo ""

# Create database dump
echo "📦 Creating database dump..."
sqlite3 data/db/qa-assist.db .dump > data-backup.sql
CALL_COUNT=$(sqlite3 data/db/qa-assist.db "SELECT COUNT(*) FROM Call;")
echo "✅ Database dump created with $CALL_COUNT calls"
echo ""

# Upload database file directly
echo "📤 Uploading database to Railway volume..."
echo "This will replace the production database."
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Use Railway's shell to import the database
    echo "Creating import script..."
    cat > /tmp/import-db.sh <<'SCRIPT'
#!/bin/bash
mkdir -p /app/data/db /app/data/uploads /app/data/transcripts /app/data/analyses
cat > /app/data/db/qa-assist.db
echo "Database imported successfully"
SCRIPT

    # Import via stdin
    cat data-backup.sql | railway run bash -c "mkdir -p /app/data/db && sqlite3 /app/data/db/qa-assist.db"

    echo ""
    echo "✅ Upload complete!"
    echo "🎉 Your database is now in production!"
    echo ""
else
    echo "❌ Upload cancelled"
    exit 1
fi
