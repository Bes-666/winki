-- Script to create an admin user
-- Run this in Supabase SQL Editor after running admin_auth_migration.sql
-- Replace 'your_username', 'your_email', and 'your_password_hash' with actual values

-- First, create a regular user (if not exists)
-- Note: You'll need to get the user_id from your users table or create one via Telegram bot

-- Example: Create admin user entry
-- Replace 'USER_ID_HERE' with actual user UUID from users table

INSERT INTO admin_users (
  user_id,
  username,
  email,
  password_hash,
  permissions,
  is_active
) VALUES (
  'USER_ID_HERE'::uuid,  -- Replace with actual user_id
  'admin',                -- Username
  'admin@example.com',   -- Email
  '$2a$10$YourHashedPasswordHere',  -- Use bcrypt to hash password
  ARRAY['all'],          -- Permissions
  true
) ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active;

-- To generate password hash, you can use Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your_password', 10);
-- console.log(hash);

