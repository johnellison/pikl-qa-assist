#!/bin/bash

# Export only complete (transcribed + analyzed) calls to production

echo "🔍 Analyzing local database..."
echo ""

# Check status counts
echo "Call Status Summary:"
sqlite3 data/db/qa-assist.db "SELECT status, COUNT(*) as count FROM Call GROUP BY status;"
echo ""

# Get complete call IDs
COMPLETE_IDS=$(sqlite3 data/db/qa-assist.db "SELECT id FROM Call WHERE status = 'complete';" | tr '\n' ',' | sed 's/,$//')
COMPLETE_COUNT=$(sqlite3 data/db/qa-assist.db "SELECT COUNT(*) FROM Call WHERE status = 'complete';")

echo "✅ Found $COMPLETE_COUNT complete calls (transcribed + analyzed)"
echo ""

read -p "Export only complete calls? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Export cancelled"
    exit 1
fi

echo "📦 Creating filtered database dump..."

# Create a temporary database with only complete calls
TMP_DB="/tmp/filtered-qa-assist.db"
rm -f "$TMP_DB"

# Copy schema
sqlite3 data/db/qa-assist.db ".schema" | sqlite3 "$TMP_DB"

# Export only complete calls and their related data
sqlite3 data/db/qa-assist.db <<EOF | sqlite3 "$TMP_DB"
-- Export complete calls
.mode insert Call
SELECT * FROM Call WHERE status = 'complete';

-- Export related transcripts
.mode insert Transcript
SELECT t.* FROM Transcript t
INNER JOIN Call c ON t.callId = c.id
WHERE c.status = 'complete';

-- Export related analyses
.mode insert Analysis
SELECT a.* FROM Analysis a
INNER JOIN Call c ON a.callId = c.id
WHERE c.status = 'complete';

-- Export related QA scores
.mode insert QAScores
SELECT q.* FROM QAScores q
INNER JOIN Analysis a ON q.analysisId = a.id
INNER JOIN Call c ON a.callId = c.id
WHERE c.status = 'complete';

-- Export related compliance issues
.mode insert ComplianceIssue
SELECT ci.* FROM ComplianceIssue ci
INNER JOIN Analysis a ON ci.analysisId = a.id
INNER JOIN Call c ON a.callId = c.id
WHERE c.status = 'complete';

-- Export related key moments
.mode insert KeyMoment
SELECT km.* FROM KeyMoment km
INNER JOIN Analysis a ON km.analysisId = a.id
INNER JOIN Call c ON a.callId = c.id
WHERE c.status = 'complete';

-- Export related coaching recommendations
.mode insert CoachingRecommendation
SELECT cr.* FROM CoachingRecommendation cr
INNER JOIN Analysis a ON cr.analysisId = a.id
INNER JOIN Call c ON a.callId = c.id
WHERE c.status = 'complete';

-- Export related outcome metrics
.mode insert OutcomeMetrics
SELECT om.* FROM OutcomeMetrics om
INNER JOIN Analysis a ON om.analysisId = a.id
INNER JOIN Call c ON a.callId = c.id
WHERE c.status = 'complete';
EOF

# Create SQL dump
sqlite3 "$TMP_DB" .dump > data-complete-calls.sql

echo "✅ Created filtered dump: data-complete-calls.sql"
echo "📊 Contains $COMPLETE_COUNT complete calls with all related data"
echo ""
echo "Ready to upload to production!"
