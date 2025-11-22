"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/components/admin/useAdminAuth';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';

interface OverviewStats {
  totalUsers: number;
  totalStaked: number;
  rewardsPaidOut: number;
  nftsMinted: number;
  totalCarbonOffset: number;
  projectsCount: number;
}

export default function AdminOverviewPage() {
  const { token, user, loading } = useAdminAuth({ require: true });
  const router = useRouter();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/admin/login');
    }
  }, [loading, token, router]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      const res = await fetch(`${API_BASE}/admin/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to load overview');
        return;
      }
      const data = (await res.json()) as OverviewStats;
      setStats(data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error(err);
      setError('Unexpected error while loading overview');
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

  if (loading || !token || !user) {
    return <div className="text-gray-400 text-sm">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neon-green mb-1">Overview</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-gray-400">
            Welcome, <span className="text-white font-medium">{user.email || user.username || 'Admin'}</span>. Here is
            the current GreenFi impact snapshot.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            {lastUpdated && (
              <span>
                Last updated:{' '}
                <span className="text-neon-green">
                  {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
            )}
            <button
              onClick={fetchStats}
              disabled={refreshing}
              className="px-3 py-1 rounded-full border border-neon-green/50 text-[11px] text-neon-green hover:bg-neon-green/10 disabled:opacity-60"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} />
        <StatCard title="Total Staked" value={stats?.totalStaked ?? 0} suffix=" HBAR" />
        <StatCard title="Rewards Paid Out" value={stats?.rewardsPaidOut ?? 0} suffix=" HBAR" />
        <StatCard title="Impact NFTs Minted" value={stats?.nftsMinted ?? 0} />
        <StatCard title="Total Carbon Offset" value={stats?.totalCarbonOffset ?? 0} suffix=" tCO₂" />
        <StatCard title="Projects" value={stats?.projectsCount ?? 0} />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
}

function StatCard({ title, value, suffix }: StatCardProps) {
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  return (
    <div className="rounded-xl border border-neon-green/20 bg-black/60 px-4 py-3 shadow-[0_0_25px_rgba(0,255,136,0.15)]">
      <div className="text-xs text-gray-400 mb-1">{title}</div>
      <div className="text-xl font-semibold text-neon-green">
        {formatted}
        {suffix && <span className="text-xs text-gray-400 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
