-- Migration: Add avatar_url column to users table
-- Created: 2025-11-24
-- Description: Adds avatar_url column to support user avatar images

-- Check if column exists before adding (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN avatar_url VARCHAR(500) NULL;
        
        COMMENT ON COLUMN users.avatar_url IS 'URL to user avatar image (stored in MinIO/S3)';
    END IF;
END $$;

