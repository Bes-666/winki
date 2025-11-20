'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        router.push('/login?redirect=admin');
        return;
      }

      // Verify token with API
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminToken }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_token');
        router.push('/login?redirect=admin');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('admin_token');
      router.push('/login?redirect=admin');
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login?redirect=admin');
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Редирект уже произошел
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header with logout */}
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary-400" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}


