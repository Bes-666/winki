#!/usr/bin/env node

/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <username> <password> <email> [user_id]
 * 
 * Example: node scripts/create-admin.js admin mypassword admin@example.com
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdmin() {
  const [username, password, email, userId] = process.argv.slice(2);

  if (!username || !password || !email) {
    console.error('Usage: node scripts/create-admin.js <username> <password> <email> [user_id]');
    process.exit(1);
  }

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    let finalUserId = userId;

    // If no user_id provided, create a placeholder user or use existing
    if (!finalUserId) {
      console.log('No user_id provided. Creating admin user without user reference...');
      // You might want to create a user first or use an existing one
      console.error('Error: user_id is required. Please provide a valid user UUID from users table');
      process.exit(1);
    }

    // Insert admin user
    const { data, error } = await supabase
      .from('admin_users')
      .upsert({
        user_id: finalUserId,
        username,
        email,
        password_hash: passwordHash,
        permissions: ['all'],
        is_active: true,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('ID:', data.id);
    console.log('\nYou can now login to the admin panel with these credentials.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();

