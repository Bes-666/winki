-- Migration: Add login credentials to admin_users table
-- Run this in Supabase SQL Editor

-- Add username and password_hash columns to admin_users
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- Create index for active admins
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

-- Update RLS policy to allow admins to view their own data
DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;

CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (SELECT auth.uid()) 
      AND users.role = 'admin'
    )
  );

-- Allow service role to manage admin_users (for API operations)
CREATE POLICY "Service role can manage admin_users" ON admin_users
  FOR ALL USING (true)
  WITH CHECK (true);

