CREATE TABLE IF NOT EXISTS "AnalyticsVisit" (
	"id" TEXT NOT NULL,
	"visitorHash" TEXT NOT NULL,
	"sessionId" TEXT NOT NULL,
	"pagePath" TEXT NOT NULL,
	"referrer" TEXT NOT NULL,
	"referrerSource" TEXT NOT NULL,
	"deviceType" TEXT NOT NULL,
	"browser" TEXT NOT NULL,
	"country" TEXT,
	"loggedIn" BOOLEAN NOT NULL DEFAULT false,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "AnalyticsVisit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AnalyticsVisit_createdAt_idx" ON "AnalyticsVisit"("createdAt");
CREATE INDEX IF NOT EXISTS "AnalyticsVisit_visitorHash_createdAt_idx" ON "AnalyticsVisit"("visitorHash", "createdAt");
CREATE INDEX IF NOT EXISTS "AnalyticsVisit_pagePath_createdAt_idx" ON "AnalyticsVisit"("pagePath", "createdAt");
CREATE INDEX IF NOT EXISTS "AnalyticsVisit_sessionId_createdAt_idx" ON "AnalyticsVisit"("sessionId", "createdAt");
