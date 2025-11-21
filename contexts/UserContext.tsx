'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  telegram_id?: number;
  username?: string;
  first_name?: string;
  balance: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initUser();
  }, []);

  const initUser = async () => {
    try {
      // Проверяем, открыто ли приложение через Telegram Web App
      const tg = (window as any).Telegram?.WebApp;
      
      if (tg && tg.initDataUnsafe?.user) {
        // Пользователь открыл через Telegram
        const tgUser = tg.initDataUnsafe.user;
        await loadOrCreateUser(tgUser.id, tgUser.username, tgUser.first_name);
      } else {
        // Для разработки: используем localStorage или демо-режим
        const storedUserId = localStorage.getItem('demo_user_id');
        if (storedUserId) {
          await loadUser(storedUserId);
        } else {
          // Демо-режим: создаем временного пользователя
          setUser({
            id: 'user-id-placeholder',
            balance: 1000,
          });
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      // Fallback к демо-режиму
      setUser({
        id: 'user-id-placeholder',
        balance: 1000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrCreateUser = async (telegramId: number, username?: string, firstName?: string) => {
    try {
      // Ищем существующего пользователя
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (existingUser) {
        setUser(existingUser);
        localStorage.setItem('demo_user_id', existingUser.id);
        return;
      }

      // Создаем нового пользователя
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramId,
          username: username,
          first_name: firstName,
          balance: 1000,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return;
      }

      if (newUser) {
        setUser(newUser);
        localStorage.setItem('demo_user_id', newUser.id);
      }
    } catch (error) {
      console.error('Error loading/creating user:', error);
    }
  };

  const loadUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user:', error);
        return;
      }

      if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

