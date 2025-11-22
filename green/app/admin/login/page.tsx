"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data.user || data.user.role !== 'ADMIN') {
        setError('This account is not an admin');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('greenfi_admin_token', data.token);
        localStorage.setItem('greenfi_admin_user', JSON.stringify(data.user));
      }

      router.push('/admin');
    } catch (err) {
      console.error(err);
      setError('Unexpected error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="relative w-full max-w-md rounded-2xl border border-neon-green/20 bg-gradient-to-b from-black/90 via-black to-black/90 p-8 shadow-[0_0_40px_rgba(0,255,136,0.3)]">
        <div className="absolute -top-10 right-10 w-24 h-24 bg-neon-green/20 rounded-full blur-3xl" />
        <h1 className="text-2xl font-semibold text-neon-green mb-2">GreenFi Admin</h1>
        <p className="text-sm text-gray-400 mb-6">Sign in with an admin account to manage the platform.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-black border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-black border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green"
              required
            />
          </div>

          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-neon-green text-black text-sm font-semibold py-2 hover:bg-emerald-300 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
