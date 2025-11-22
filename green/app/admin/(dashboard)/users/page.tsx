"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/components/admin/useAdminAuth';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';

interface AdminUserRow {
  id: string;
  email?: string;
  username?: string;
  walletAddress?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { token, loading } = useAdminAuth({ require: true });
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');

  useEffect(() => {
    if (!loading && !token) {
      router.push('/admin/login');
    }
  }, [loading, token, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || 'Failed to load users');
          return;
        }
        const data = (await res.json()) as { users: AdminUserRow[] };
        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
        setError('Unexpected error while loading users');
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) {
        return false;
      }
      if (!term) return true;
      const haystack = `${u.email || ''} ${u.username || ''} ${u.walletAddress || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [users, search, roleFilter]);

  if (loading || !token) {
    return <div className="text-gray-400 text-sm">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neon-green mb-1">Users</h1>
        <p className="text-sm text-gray-400">Overview of GreenFi accounts and their roles.</p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, username, or wallet"
            className="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
            className="px-2 py-1 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-neon-green"
          >
            <option value="ALL">All roles</option>
            <option value="ADMIN">Admins</option>
            <option value="USER">Users</option>
          </select>
        </div>
        <div className="text-[11px] text-gray-400">
          Showing <span className="text-neon-green">{filteredUsers.length}</span> of{' '}
          <span className="text-neon-green">{users.length}</span> users
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neon-green/20 bg-black/60">
        <table className="min-w-full text-sm">
          <thead className="bg-black/80 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Wallet</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-t border-gray-800 hover:bg-neon-green/5">
                <td className="px-4 py-2 text-gray-200">{u.email || '-'}</td>
                <td className="px-4 py-2 text-gray-300">{u.username || '-'}</td>
                <td className="px-4 py-2 text-xs text-gray-400 font-mono">{u.walletAddress || '-'}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      u.role === 'ADMIN'
                        ? 'px-2 py-0.5 rounded-full text-[10px] bg-neon-green text-black font-semibold'
                        : 'px-2 py-0.5 rounded-full text-[10px] bg-gray-800 text-gray-300'
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-xs text-gray-500">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
