-- EasyBooking schema for Supabase (PostgreSQL)
-- Note: For simplicity, we disable RLS on these tables for server-side access via anon key.
-- In production, create proper RLS policies and use the service role key on the backend.

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  amenities TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

-- Prevent overlapping bookings per room (constraint via EXCLUDE if extension btree_gist is available)
-- For Supabase, enable extension then constraint:
-- CREATE EXTENSION IF NOT EXISTS btree_gist;
-- ALTER TABLE bookings ADD CONSTRAINT no_overlap EXCLUDE USING GIST (
--   room_id WITH =,
--   tstzrange(start_time, end_time, '[)') WITH &&
-- );

-- Alternatively handled at application level (already implemented in model/Booking.js)

-- Disable RLS if enabled by default in Supabase project
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
