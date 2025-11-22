"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminUser {
  id: string;
  email?: string;
  username?: string;
  role: 'USER' | 'ADMIN';
}

interface UseAdminAuthOptions {
  require?: boolean;
}

export function useAdminAuth(options?: UseAdminAuthOptions) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('greenfi_admin_token');
    const storedUser = localStorage.getItem('greenfi_admin_user');

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as AdminUser;
        setToken(storedToken);
        setUser(parsed);
      } catch {
        localStorage.removeItem('greenfi_admin_token');
        localStorage.removeItem('greenfi_admin_user');
      }
    } else if (options?.require) {
      router.push('/admin/login');
    }

    setLoading(false);
  }, [options?.require, router]);

  return { token, user, loading };
}
