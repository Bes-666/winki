'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { checkAdminAccess } from '@/lib/admin-auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // TODO: Реализовать реальную систему аутентификации
      // Пока проверяем через localStorage
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken) {
        // Проверяем токен
        setIsAuthenticated(true);
      } else {
        setShowLogin(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogin = async () => {
    // TODO: Реализовать реальную систему аутентификации
    // Пока простая проверка пароля (в продакшене использовать безопасную аутентификацию)
    if (password === 'admin123') {
      localStorage.setItem('admin_token', 'admin_session');
      setIsAuthenticated(true);
      setShowLogin(false);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showLogin || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 mx-auto mb-4 text-primary-400" />
            <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
            <p className="text-dark-muted">Enter admin password to continue</p>
          </div>
          
          <div className="space-y-4">
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              error={error}
            />
            
            <Button
              onClick={handleLogin}
              variant="primary"
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}


