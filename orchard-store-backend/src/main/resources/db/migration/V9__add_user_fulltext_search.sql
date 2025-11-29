-- Migration: Add full-text search indexes and support for users table
-- This improves search performance for email, full_name, and phone fields

-- Add GIN index for full-text search on email, full_name, and phone
-- Using tsvector_ops for better performance with text search
CREATE INDEX IF NOT EXISTS idx_users_email_gin ON users USING gin(to_tsvector('english', coalesce(email, '')));
CREATE INDEX IF NOT EXISTS idx_users_fullname_gin ON users USING gin(to_tsvector('english', coalesce(full_name, '')));
CREATE INDEX IF NOT EXISTS idx_users_phone_gin ON users USING gin(to_tsvector('english', coalesce(phone, '')));

-- Add composite GIN index for combined search across all three fields
-- This allows searching across email, full_name, and phone in a single query
CREATE INDEX IF NOT EXISTS idx_users_search_combined_gin ON users USING gin(
    to_tsvector('english', 
        coalesce(email, '') || ' ' || 
        coalesce(full_name, '') || ' ' || 
        coalesce(phone, '')
    )
);

-- Add regular B-tree indexes for exact matches and sorting (if not already exist)
-- These are useful for exact email lookups and sorting
CREATE INDEX IF NOT EXISTS idx_users_email_btree ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_fullname_btree ON users(full_name);
CREATE INDEX IF NOT EXISTS idx_users_phone_btree ON users(phone);

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Note: PostgreSQL full-text search uses 'english' text search configuration
-- This provides stemming (e.g., "running" matches "run") and stop word removal
-- For Vietnamese or other languages, you may need to install additional text search configurations

