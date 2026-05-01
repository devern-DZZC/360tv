-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youtubeVideoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT NOT NULL,
    "thumbnailHigh" TEXT,
    "channelId" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "sport" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "scheduledStartTime" DATETIME,
    "actualStartTime" DATETIME,
    "actualEndTime" DATETIME,
    "liveBroadcastContent" TEXT,
    "duration" TEXT,
    "viewCount" INTEGER,
    "likeCount" INTEGER,
    "concurrentViewers" INTEGER,
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "trigger" TEXT NOT NULL,
    "totalFetched" INTEGER NOT NULL DEFAULT 0,
    "totalUpserted" INTEGER NOT NULL DEFAULT 0,
    "totalErrors" INTEGER NOT NULL DEFAULT 0,
    "errorDetails" TEXT,
    "durationMs" INTEGER,
    "quotaUsed" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "Stream_youtubeVideoId_key" ON "Stream"("youtubeVideoId");

-- CreateIndex
CREATE INDEX "Stream_status_idx" ON "Stream"("status");

-- CreateIndex
CREATE INDEX "Stream_sport_idx" ON "Stream"("sport");

-- CreateIndex
CREATE INDEX "Stream_status_sport_idx" ON "Stream"("status", "sport");

-- CreateIndex
CREATE INDEX "Stream_scheduledStartTime_idx" ON "Stream"("scheduledStartTime");

-- CreateIndex
CREATE INDEX "Stream_actualStartTime_idx" ON "Stream"("actualStartTime");

-- CreateIndex
CREATE INDEX "Stream_actualEndTime_idx" ON "Stream"("actualEndTime");

-- CreateIndex
CREATE INDEX "Stream_status_scheduledStartTime_idx" ON "Stream"("status", "scheduledStartTime");

-- CreateIndex
CREATE INDEX "Stream_createdAt_idx" ON "Stream"("createdAt");

-- CreateIndex
CREATE INDEX "SyncLog_startedAt_idx" ON "SyncLog"("startedAt");

-- CreateIndex
CREATE INDEX "SyncLog_status_idx" ON "SyncLog"("status");
