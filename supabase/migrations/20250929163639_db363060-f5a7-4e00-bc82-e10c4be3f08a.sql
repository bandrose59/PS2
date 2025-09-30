-- Add recruiter role to the enum (separate transaction)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'recruiter';