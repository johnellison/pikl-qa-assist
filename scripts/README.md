# Migration Scripts

This directory contains scripts for migrating data between storage formats.

## migrate-json-to-sqlite.ts

Migrates all call data from JSON file storage to the SQLite database using Prisma ORM.

### Usage

```bash
npm run migrate:json-to-sqlite
```

### What it does

1. **Reads all calls** from JSON storage (`data/calls/calls.json`)
2. **Migrates call records** to the `Call` table in SQLite
3. **Migrates transcripts** (if available) to the `Transcript` table
4. **Migrates analyses** (if available) to multiple related tables:
   - `Analysis` - Main analysis data
   - `QAScores` - Detailed scoring dimensions
   - `KeyMoment` - Key moments in the call
   - `CoachingRecommendation` - Coaching recommendations
   - `ComplianceIssue` - Compliance issues detected
   - `OutcomeMetrics` - Call outcome metrics

### Features

- **Duplicate detection**: Skips calls that already exist in the database
- **Error handling**: Logs errors but continues processing other records
- **Progress tracking**: Shows real-time progress for each record
- **Migration summary**: Displays detailed statistics at the end

### Example Output

```
🚀 Starting migration from JSON to SQLite...

📖 Reading calls from JSON storage...
   Found 90 calls

📝 Migrating call 1866...
  ✅ Migrated call: 1866

📝 Migrating call 1728...
  ✅ Migrated call: 1728

...

============================================================
📊 Migration Summary:
============================================================
Calls:        77/90 migrated (0 failed)
Transcripts:  0/0 migrated
Analyses:     0/0 migrated
============================================================

✨ Migration complete!
```

### Notes

- The script is idempotent - you can run it multiple times safely
- Existing records will be skipped to avoid duplicates
- The JSON files are not modified or deleted
- All operations are performed in transactions for data integrity

### Rollback

To rollback the migration and start fresh:

```bash
# Reset the database
npx prisma migrate reset --force

# Re-run the migration
npm run migrate:json-to-sqlite
```

### Verification

To verify the migrated data, use Prisma Studio:

```bash
npm run db:studio
```

This will open a web interface at http://localhost:5555 where you can browse all tables and records.
