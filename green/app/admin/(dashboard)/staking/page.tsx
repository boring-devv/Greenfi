"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

interface StakeRate {
  apr: number;
  lockDays: number;
}

interface StakeRecord {
  id: string;
  walletAddress: string;
  amount: number;
  rewards: number;
  status: "ACTIVE" | "CLAIMED" | "WITHDRAWN" | string;
  createdAt: string;
  updatedAt: string;
  lastClaimAt?: string;
}

interface WalletStakeResponse {
  stakes: StakeRecord[];
  totalStaked: number;
  totalRewardsAccrued: number;
}

export default function AdminStakingPage() {
  const { token, loading } = useAdminAuth({ require: true });
  const router = useRouter();
  const [rate, setRate] = useState<StakeRate | null>(null);
  const [walletInput, setWalletInput] = useState("");
  const [stakes, setStakes] = useState<StakeRecord[]>([]);
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/admin/login");
    }
  }, [loading, token, router]);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch(`${API_BASE}/stake/rate`);
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as StakeRate;
        setRate(data);
      } catch {
      }
    };

    fetchRate();
  }, []);

  const handleLookup = async () => {
    if (!walletInput.trim()) {
      setError("Wallet address is required");
      return;
    }
    setError(null);
    setLoadingWallet(true);
    try {
      const res = await fetch(`${API_BASE}/stake/${encodeURIComponent(walletInput.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to load stakes for this wallet");
        setStakes([]);
        setTotalStaked(0);
        setTotalRewards(0);
        return;
      }
      const data = (await res.json()) as WalletStakeResponse;
      setStakes(data.stakes || []);
      setTotalStaked(data.totalStaked || 0);
      setTotalRewards(data.totalRewardsAccrued || 0);
    } catch {
      setError("Unexpected error while loading wallet stakes");
      setStakes([]);
      setTotalStaked(0);
      setTotalRewards(0);
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleClaim = async (stakeId: string) => {
    try {
      const res = await fetch(`${API_BASE}/stake/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stakeId }),
      });
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { stake: StakeRecord };
      setStakes((prev) => prev.map((s) => (s.id === stakeId ? data.stake : s)));
    } catch {
    }
  };

  const handleWithdraw = async (stakeId: string) => {
    try {
      const res = await fetch(`${API_BASE}/stake/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stakeId }),
      });
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { stake: StakeRecord };
      setStakes((prev) => prev.map((s) => (s.id === stakeId ? data.stake : s)));
    } catch {
    }
  };

  if (loading || !token) {
    return <div className="text-gray-400 text-sm">Loading staking...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neon-green mb-1">Staking</h1>
        <p className="text-sm text-gray-400">
          Monitor staking activity and simulate rewards based on the configured APR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="rounded-xl border border-neon-green/20 bg-black/60 px-4 py-3">
          <div className="text-gray-400 mb-1">Current APR</div>
          <div className="text-xl font-semibold text-neon-green">
            {rate ? `${rate.apr.toFixed(2)}%` : "-"}
          </div>
        </div>
        <div className="rounded-xl border border-neon-green/20 bg-black/60 px-4 py-3">
          <div className="text-gray-400 mb-1">Lock period</div>
          <div className="text-xl font-semibold text-neon-green">
            {rate && rate.lockDays ? `${rate.lockDays} days` : "None"}
          </div>
        </div>
        <div className="rounded-xl border border-neon-green/20 bg-black/60 px-4 py-3">
          <div className="text-gray-400 mb-1">Looked-up wallet totals</div>
          <div className="text-xs text-gray-400 space-x-4">
            <span>
              Staked: <span className="text-neon-green">{totalStaked}</span>
            </span>
            <span>
              Rewards: <span className="text-neon-green">{totalRewards.toFixed(4)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neon-green/20 bg-black/60 p-4 space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="font-semibold text-neon-green text-sm">Inspect wallet stakes</div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="Wallet address"
              className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
            />
            <button
              onClick={handleLookup}
              disabled={loadingWallet}
              className="px-3 py-1 rounded-full bg-neon-green text-black text-xs font-semibold hover:bg-neon-green/90 disabled:opacity-60"
            >
              {loadingWallet ? "Loading..." : "Lookup"}
            </button>
          </div>
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-neon-green/20 bg-black/60">
        <table className="min-w-full text-sm">
          <thead className="bg-black/80 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Stake ID</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Rewards</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stakes.map((s) => (
              <tr key={s.id} className="border-t border-gray-800 hover:bg-neon-green/5">
                <td className="px-4 py-2 text-xs text-gray-400 font-mono">
                  {s.id.slice(0, 10)}...
                </td>
                <td className="px-4 py-2 text-gray-200">{s.amount}</td>
                <td className="px-4 py-2 text-gray-200">{s.rewards.toFixed(4)}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-800 text-gray-300 uppercase">
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-2 text-xs flex items-center gap-2">
                  <button
                    onClick={() => handleClaim(s.id)}
                    className="px-2 py-0.5 rounded-full border border-neon-green/60 text-[10px] text-neon-green hover:bg-neon-green/10"
                  >
                    Claim
                  </button>
                  {s.status !== "WITHDRAWN" && (
                    <button
                      onClick={() => handleWithdraw(s.id)}
                      className="px-2 py-0.5 rounded-full border border-red-500/60 text-[10px] text-red-400 hover:bg-red-500/10"
                    >
                      Withdraw
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {stakes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-xs text-gray-500">
                  Enter a wallet address above to view staking positions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
