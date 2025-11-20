'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, User, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Проверяем, нужно ли перенаправить в админку
  // Админ-вход доступен только через прямой URL с параметром
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect === 'admin') {
      setLoginType('admin');
    } else {
      // По умолчанию показываем только User, админ-опция скрыта
      setLoginType('user');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username || !password) {
        setError('Please enter both username and password');
        setIsLoading(false);
        return;
      }

      if (loginType === 'admin') {
        // Админ-вход
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem('admin_token', data.token);
          router.push('/admin');
        } else {
          setError(data.error || 'Invalid credentials');
        }
      } else {
        // Обычный пользователь - пока заглушка
        // TODO: Реализовать вход для обычных пользователей
        setError('User login not implemented yet. Please use Telegram bot.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-500/10 mb-4">
              {loginType === 'admin' ? (
                <Shield className="w-10 h-10 text-primary-400" />
              ) : (
                <User className="w-10 h-10 text-primary-400" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {loginType === 'admin' ? 'Admin Login' : 'User Login'}
            </h1>
            <p className="text-dark-muted">
              {loginType === 'admin' 
                ? 'Enter your admin credentials to continue' 
                : 'Sign in to your account'}
            </p>
          </div>

          {/* Переключатель типа входа - показываем админ только если есть redirect=admin */}
          {searchParams.get('redirect') === 'admin' && (
            <div className="flex gap-2 mb-6 p-1 bg-dark-card rounded-lg">
              <button
                onClick={() => {
                  setLoginType('user');
                  setError('');
                  setUsername('');
                  setPassword('');
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginType === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-muted hover:text-dark-text'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                User
              </button>
              <button
                onClick={() => {
                  setLoginType('admin');
                  setError('');
                  setUsername('');
                  setPassword('');
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginType === 'admin'
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-muted hover:text-dark-text'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Admin
              </button>
            </div>
          )}

          {/* Форма входа */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}

            <div>
              <Input
                type="text"
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
                autoFocus
                required
              />
            </div>

            <div>
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </div>

            {loginType === 'user' && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-xs text-warning">
                  💡 User login is coming soon. For now, please use the Telegram bot to access your account.
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading || !username || !password}
            >
              <Lock className="w-4 h-4 mr-2" />
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Дополнительная информация */}
          <div className="mt-6 pt-6 border-t border-dark-border">
            {loginType === 'admin' ? (
              <p className="text-xs text-center text-dark-muted">
                Only authorized administrators can access the admin panel
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-center text-dark-muted">
                  New to SkillStock?
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // TODO: Редирект на регистрацию или Telegram бота
                    window.open('https://t.me/your_bot', '_blank');
                  }}
                >
                  Get Started via Telegram
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-dark-bg">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

