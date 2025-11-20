import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Decode token (simple base64, in production use JWT)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [adminId] = decoded.split(':');

    const supabaseAdmin = getSupabaseAdmin();

    // Verify admin user exists and is active
    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('*, users!inner(id, role)')
      .eq('id', adminId)
      .eq('is_active', true)
      .single();

    if (error || !adminUser || adminUser.users?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        permissions: adminUser.permissions || [],
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

