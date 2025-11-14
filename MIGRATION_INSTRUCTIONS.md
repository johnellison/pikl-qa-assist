# Railway Database Migration Instructions

## Quick Migration Steps

### Step 1: Link to Railway
```bash
railway link
```
Select your `pikl-qa-assist` service when prompted.

### Step 2: Copy Database File

The easiest way is to copy the entire database file:

```bash
# Create a tarball of your data directory
tar -czf data.tar.gz data/

# Upload to Railway and extract
railway run bash -c "cd /app && tar -xzf -" < data.tar.gz
```

### Step 3: Verify

```bash
# Check that the database has your calls
railway run sqlite3 /app/data/db/qa-assist.db "SELECT COUNT(*) FROM Call;"
```

You should see: **134**

---

## Alternative: SQL Import Method

If the tar method doesn't work, try importing the SQL dump:

```bash
# Step 1: Create the database dump (already done)
sqlite3 data/db/qa-assist.db .dump > data-backup.sql

# Step 2: Import to Railway
cat data-backup.sql | railway run bash -c "mkdir -p /app/data/db && sqlite3 /app/data/db/qa-assist.db"

# Step 3: Verify
railway run sqlite3 /app/data/db/qa-assist.db "SELECT COUNT(*) FROM Call;"
```

---

## Manual Method (Most Reliable)

1. **Get Railway Shell**
```bash
railway shell
```

2. **In the Railway shell, create directories:**
```bash
mkdir -p /app/data/db /app/data/uploads /app/data/transcripts /app/data/analyses
```

3. **Exit the shell** (`Ctrl+D` or `exit`)

4. **Copy your local database:**
```bash
# From your local terminal
cat data/db/qa-assist.db | railway run bash -c "cat > /app/data/db/qa-assist.db"
```

5. **Verify:**
```bash
railway run sqlite3 /app/data/db/qa-assist.db "SELECT COUNT(*) FROM Call;"
```

---

## After Migration

1. Visit your Railway URL
2. Login with password: **Pikl what you love 2025!**
3. Verify all 134 calls are visible in the dashboard
