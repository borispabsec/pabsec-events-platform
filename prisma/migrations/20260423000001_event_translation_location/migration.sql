-- Add localized location field to event_translations
ALTER TABLE "event_translations" ADD COLUMN "location" TEXT;

-- Fix 67th GA start date to June 30
UPDATE "events"
SET "startDate" = '2026-06-30 09:00:00'
WHERE slug = 'pabsec-67th-general-assembly';

-- Force dark text on the bright daytime hero photo
UPDATE "events"
SET "heroTextColor" = 'dark'
WHERE slug = 'pabsec-67th-general-assembly';

-- Update 67th GA EN translation
UPDATE "event_translations"
SET "title"    = '67th PABSEC General Assembly',
    "location" = 'Tbilisi, Georgia'
WHERE "locale" = 'en'
  AND "eventId" = (SELECT id FROM events WHERE slug = 'pabsec-67th-general-assembly');

-- Update 67th GA RU translation
UPDATE "event_translations"
SET "title"    = '67-я сессия Генеральной Ассамблеи ПАЧЭС',
    "location" = 'Тбилиси, Грузия'
WHERE "locale" = 'ru'
  AND "eventId" = (SELECT id FROM events WHERE slug = 'pabsec-67th-general-assembly');

-- Update 67th GA TR translation
UPDATE "event_translations"
SET "title"    = 'KEİPA Genel Kurulunun 67. Olağan Oturumu',
    "location" = 'Tiflis, Gürcistan'
WHERE "locale" = 'tr'
  AND "eventId" = (SELECT id FROM events WHERE slug = 'pabsec-67th-general-assembly');
