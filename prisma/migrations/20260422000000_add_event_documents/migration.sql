CREATE TABLE "event_documents" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "event_documents_eventId_locale_idx" ON "event_documents"("eventId", "locale");

ALTER TABLE "event_documents" ADD CONSTRAINT "event_documents_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
