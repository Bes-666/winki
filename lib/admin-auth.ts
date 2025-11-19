import { supabase } from './supabase';

export async function checkAdminAccess(userId: string): Promise<boolean> {
  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return false;
  }

  return user.role === 'admin';
}

export async function requireAdmin(userId: string): Promise<{ authorized: boolean; error?: string }> {
  const isAdmin = await checkAdminAccess(userId);
  
  if (!isAdmin) {
    return { authorized: false, error: 'Unauthorized: Admin access required' };
  }

  return { authorized: true };
}


