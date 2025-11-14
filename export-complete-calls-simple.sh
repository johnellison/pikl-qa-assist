#!/bin/bash

# Export only complete (transcribed + analyzed) calls

echo "🔍 Checking database..."
COMPLETE_COUNT=$(sqlite3 data/db/qa-assist.db "SELECT COUNT(*) FROM Call WHERE status = 'complete';")
TOTAL_COUNT=$(sqlite3 data/db/qa-assist.db "SELECT COUNT(*) FROM Call;")

echo "Database Summary:"
echo "  Total calls: $TOTAL_COUNT"
echo "  Complete calls: $COMPLETE_COUNT"
echo ""

sqlite3 data/db/qa-assist.db "SELECT status, COUNT(*) as count FROM Call GROUP BY status;"
echo ""

read -p "Export $COMPLETE_COUNT complete calls only? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo "📦 Creating filtered export..."

# Get all complete call IDs
CALL_IDS=$(sqlite3 -csv data/db/qa-assist.db "SELECT id FROM Call WHERE status = 'complete';" | paste -sd "," -)

# Create filtered SQL dump
sqlite3 data/db/qa-assist.db > data-complete-calls.sql <<EOF
-- Schema
.output /dev/stdout
.schema

-- Only export complete calls and their related data
DELETE FROM Call WHERE status != 'complete';
DELETE FROM Transcript WHERE callId NOT IN (SELECT id FROM Call);
DELETE FROM Analysis WHERE callId NOT IN (SELECT id FROM Call);
DELETE FROM QAScores WHERE analysisId NOT IN (SELECT id FROM Analysis);
DELETE FROM ComplianceIssue WHERE analysisId NOT IN (SELECT id FROM Analysis);
DELETE FROM KeyMoment WHERE analysisId NOT IN (SELECT id FROM Analysis);
DELETE FROM CoachingRecommendation WHERE analysisId NOT IN (SELECT id FROM Analysis);
DELETE FROM OutcomeMetrics WHERE analysisId NOT IN (SELECT id FROM Analysis);

.dump Call Transcript Analysis QAScores ComplianceIssue KeyMoment CoachingRecommendation OutcomeMetrics
EOF

echo "✅ Created: data-complete-calls.sql"
echo "📊 Contains $COMPLETE_COUNT complete calls"
echo ""
echo "Now run: ./upload-to-production.sh"
echo "And use 'data-complete-calls.sql' when prompted"
