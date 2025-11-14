-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "callId" TEXT NOT NULL,
    "callType" TEXT,
    "overallScore" REAL NOT NULL,
    "qaScore" REAL,
    "complianceScore" REAL,
    "summary" TEXT NOT NULL,
    "callOutcome" TEXT NOT NULL,
    "processingTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Analysis_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("callId", "callOutcome", "callType", "complianceScore", "createdAt", "id", "overallScore", "processingTime", "qaScore", "summary", "updatedAt") SELECT "callId", "callOutcome", "callType", "complianceScore", "createdAt", "id", "overallScore", "processingTime", "qaScore", "summary", "updatedAt" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
CREATE UNIQUE INDEX "Analysis_callId_key" ON "Analysis"("callId");
CREATE INDEX "Analysis_callId_idx" ON "Analysis"("callId");
CREATE INDEX "Analysis_callType_idx" ON "Analysis"("callType");
CREATE INDEX "Analysis_overallScore_idx" ON "Analysis"("overallScore");
CREATE TABLE "new_Transcript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "callId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "segments" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transcript_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transcript" ("callId", "createdAt", "duration", "id", "segments", "text", "updatedAt") SELECT "callId", "createdAt", "duration", "id", "segments", "text", "updatedAt" FROM "Transcript";
DROP TABLE "Transcript";
ALTER TABLE "new_Transcript" RENAME TO "Transcript";
CREATE UNIQUE INDEX "Transcript_callId_key" ON "Transcript"("callId");
CREATE INDEX "Transcript_callId_idx" ON "Transcript"("callId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
