ALTER TABLE "AnalyticsVisit" ADD COLUMN "userId" TEXT;

ALTER TABLE "AnalyticsVisit"
ADD CONSTRAINT "AnalyticsVisit_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "AnalyticsVisit_userId_createdAt_idx" ON "AnalyticsVisit"("userId", "createdAt");
