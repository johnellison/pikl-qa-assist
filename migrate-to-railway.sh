#!/bin/bash

# Pikl QA Assist - Railway Database Migration Script
# This script migrates your local SQLite database to Railway production

set -e

echo "🚀 Pikl QA Assist - Railway Data Migration"
echo "=========================================="
echo ""

# Step 1: Create backup dump
echo "📦 Step 1: Creating database dump..."
sqlite3 data/db/qa-assist.db .dump > data-backup.sql
echo "✅ Database dump created: data-backup.sql"
echo ""

# Step 2: Link to Railway project (if not already linked)
echo "🔗 Step 2: Linking to Railway project..."
echo "If prompted, select your pikl-qa-assist service"
railway link || echo "Already linked or manual linking required"
echo ""

# Step 3: Upload and import data
echo "📤 Step 3: Importing data to Railway..."
echo "This will replace the production database with your local data."
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Copy the database file directly to Railway volume
    echo "Uploading database to Railway..."
    railway run sqlite3 /app/data/db/qa-assist.db < data-backup.sql

    echo ""
    echo "✅ Migration complete!"
    echo "🎉 Your 134 calls are now in production!"
    echo ""
    echo "Next steps:"
    echo "1. Visit your Railway URL"
    echo "2. Login with password: Pikl what you love 2025!"
    echo "3. Verify all calls are visible"
else
    echo "❌ Migration cancelled"
    exit 1
fi
