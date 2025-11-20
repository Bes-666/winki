import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Find admin user by username
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*, users!inner(id, role)')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (adminUser.users?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Verify password
    if (!adminUser.password_hash) {
      return NextResponse.json(
        { error: 'Password not set. Please contact administrator.' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    // Create session token (in production, use JWT or similar)
    const sessionToken = Buffer.from(`${adminUser.id}:${Date.now()}`).toString('base64');

    // Return success with user info (without password)
    return NextResponse.json({
      success: true,
      token: sessionToken,
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        permissions: adminUser.permissions || [],
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

