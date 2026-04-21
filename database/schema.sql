-- PABSEC Events Platform – reference SQL schema
-- The canonical schema is in prisma/schema.prisma.
-- This file is kept for documentation and DBA reference.

CREATE TYPE "Locale" AS ENUM ('en', 'ru', 'tr');
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'WAITLISTED');
CREATE TYPE "DocumentCategory" AS ENUM ('AGENDA', 'MINUTES', 'RESOLUTION', 'REPORT', 'PRESS_RELEASE', 'OTHER');

CREATE TABLE events (
  id          TEXT        PRIMARY KEY,
  slug        TEXT        UNIQUE NOT NULL,
  status      "EventStatus" NOT NULL DEFAULT 'DRAFT',
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ NOT NULL,
  location    TEXT        NOT NULL,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE event_translations (
  id          TEXT     PRIMARY KEY,
  event_id    TEXT     NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  locale      "Locale" NOT NULL,
  title       TEXT     NOT NULL,
  description TEXT     NOT NULL,
  agenda      TEXT,
  UNIQUE (event_id, locale)
);

CREATE TABLE registrations (
  id           TEXT                 PRIMARY KEY,
  event_id     TEXT                 NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  first_name   TEXT                 NOT NULL,
  last_name    TEXT                 NOT NULL,
  email        TEXT                 NOT NULL,
  country      TEXT                 NOT NULL,
  organization TEXT,
  position     TEXT,
  dietary_needs TEXT,
  status       "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
  created_at   TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ          NOT NULL
);

CREATE TABLE documents (
  id         TEXT               PRIMARY KEY,
  event_id   TEXT,
  category   "DocumentCategory" NOT NULL,
  file_url   TEXT               NOT NULL,
  file_size  INT                NOT NULL,
  mime_type  TEXT               NOT NULL,
  is_public  BOOLEAN            NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE TABLE document_translations (
  id          TEXT     PRIMARY KEY,
  document_id TEXT     NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  locale      "Locale" NOT NULL,
  title       TEXT     NOT NULL,
  UNIQUE (document_id, locale)
);
