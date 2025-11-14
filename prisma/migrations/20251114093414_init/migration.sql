-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "transcriptUrl" TEXT,
    "analysisUrl" TEXT,
    "overallScore" REAL,
    "qaScore" REAL,
    "complianceScore" REAL,
    "callType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "errorMessage" TEXT
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "callId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "segments" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transcript_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("callId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analysis" (
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
    CONSTRAINT "Analysis_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("callId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QAScores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "analysisId" TEXT NOT NULL,
    "rapport" REAL NOT NULL,
    "needsDiscovery" REAL NOT NULL,
    "productKnowledge" REAL NOT NULL,
    "objectionHandling" REAL NOT NULL,
    "closing" REAL NOT NULL,
    "professionalism" REAL NOT NULL,
    "followUp" REAL NOT NULL,
    "callOpeningCompliance" REAL NOT NULL,
    "dataProtectionCompliance" REAL NOT NULL,
    "mandatoryDisclosures" REAL NOT NULL,
    "tcfCompliance" REAL NOT NULL,
    "salesProcessCompliance" REAL,
    "complaintsHandling" REAL,
    CONSTRAINT "QAScores_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KeyMoment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "analysisId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KeyMoment_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachingRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "analysisId" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachingRecommendation_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplianceIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "analysisId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "regulatoryReference" TEXT NOT NULL,
    "timestamp" INTEGER,
    "remediation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComplianceIssue_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutcomeMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "analysisId" TEXT NOT NULL,
    "quotesCompleted" INTEGER NOT NULL DEFAULT 0,
    "salesCompleted" INTEGER NOT NULL DEFAULT 0,
    "renewalsCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutcomeMetrics_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Call_callId_key" ON "Call"("callId");

-- CreateIndex
CREATE INDEX "Call_agentId_idx" ON "Call"("agentId");

-- CreateIndex
CREATE INDEX "Call_status_idx" ON "Call"("status");

-- CreateIndex
CREATE INDEX "Call_timestamp_idx" ON "Call"("timestamp");

-- CreateIndex
CREATE INDEX "Call_callType_idx" ON "Call"("callType");

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_callId_key" ON "Transcript"("callId");

-- CreateIndex
CREATE INDEX "Transcript_callId_idx" ON "Transcript"("callId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_callId_key" ON "Analysis"("callId");

-- CreateIndex
CREATE INDEX "Analysis_callId_idx" ON "Analysis"("callId");

-- CreateIndex
CREATE INDEX "Analysis_callType_idx" ON "Analysis"("callType");

-- CreateIndex
CREATE INDEX "Analysis_overallScore_idx" ON "Analysis"("overallScore");

-- CreateIndex
CREATE UNIQUE INDEX "QAScores_analysisId_key" ON "QAScores"("analysisId");

-- CreateIndex
CREATE INDEX "QAScores_analysisId_idx" ON "QAScores"("analysisId");

-- CreateIndex
CREATE INDEX "KeyMoment_analysisId_idx" ON "KeyMoment"("analysisId");

-- CreateIndex
CREATE INDEX "KeyMoment_type_idx" ON "KeyMoment"("type");

-- CreateIndex
CREATE INDEX "CoachingRecommendation_analysisId_idx" ON "CoachingRecommendation"("analysisId");

-- CreateIndex
CREATE INDEX "ComplianceIssue_analysisId_idx" ON "ComplianceIssue"("analysisId");

-- CreateIndex
CREATE INDEX "ComplianceIssue_severity_idx" ON "ComplianceIssue"("severity");

-- CreateIndex
CREATE INDEX "ComplianceIssue_category_idx" ON "ComplianceIssue"("category");

-- CreateIndex
CREATE UNIQUE INDEX "OutcomeMetrics_analysisId_key" ON "OutcomeMetrics"("analysisId");

-- CreateIndex
CREATE INDEX "OutcomeMetrics_analysisId_idx" ON "OutcomeMetrics"("analysisId");
