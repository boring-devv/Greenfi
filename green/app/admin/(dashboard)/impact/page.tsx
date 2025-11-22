"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

interface LeaderboardEntry {
  walletAddress: string;
  totalCarbonOffset: number;
  nfts: number;
}

interface ImpactNFTRecord {
  id: string;
  walletAddress: string;
  projectId?: string;
  carbonOffset?: number;
  createdAt: string;
}

interface UserImpactResponse {
  wallet: string;
  totalCarbonOffset: number;
  nfts: ImpactNFTRecord[];
}

export default function AdminImpactPage() {
  const { token, loading } = useAdminAuth({ require: true });
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [walletInput, setWalletInput] = useState("");
  const [userImpact, setUserImpact] = useState<UserImpactResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState<string | null>(null);
  const [mintWallet, setMintWallet] = useState("");
  const [mintProject, setMintProject] = useState("");
  const [mintDate, setMintDate] = useState("");
  const [mintTier, setMintTier] = useState("");
  const [mintCarbon, setMintCarbon] = useState("");
  const [mintTokenURI, setMintTokenURI] = useState("");

  useEffect(() => {
    if (!loading && !token) {
      router.push("/admin/login");
    }
  }, [loading, token, router]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE}/impact/leaderboard?limit=20`);
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { leaderboard: LeaderboardEntry[] };
        setLeaderboard(data.leaderboard || []);
      } catch {
      }
    };

    fetchLeaderboard();
  }, []);

  const handleLookup = async () => {
    if (!walletInput.trim()) {
      setError("Wallet address is required");
      return;
    }
    setError(null);
    setLoadingUser(true);
    try {
      const res = await fetch(`${API_BASE}/impact/user/${encodeURIComponent(walletInput.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to load user impact");
        setUserImpact(null);
        return;
      }
      const data = (await res.json()) as UserImpactResponse;
      setUserImpact(data);
    } catch {
      setError("Unexpected error while loading user impact");
      setUserImpact(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleMint = async () => {
    if (!token) return;
    setMintError(null);
    setMintSuccess(null);

    if (!mintWallet.trim()) {
      setMintError("Wallet address is required");
      return;
    }
    const carbon = Number(mintCarbon);
    if (!Number.isFinite(carbon) || carbon <= 0) {
      setMintError("Carbon offset must be a positive number");
      return;
    }
    if (!mintProject.trim() || !mintDate.trim() || !mintTier.trim()) {
      setMintError("Project, date and badge tier are required");
      return;
    }

    setMinting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/impact/mint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletAddress: mintWallet.trim(),
          carbonOffset: carbon,
          projectName: mintProject.trim(),
          date: mintDate.trim(),
          badgeTier: mintTier.trim(),
          tokenURI: mintTokenURI.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMintError(data.message || "Failed to mint impact NFT");
        return;
      }

      const data = await res.json();
      setMintSuccess(`Minted NFT on Hedera (tx: ${data.txHash ?? ""})`);
      // clear fields except wallet/project for faster repeated mints
      setMintCarbon("");
      setMintDate("");
      setMintTier("");
      setMintTokenURI("");
    } catch {
      setMintError("Unexpected error while minting impact NFT");
    } finally {
      setMinting(false);
    }
  };

  if (loading || !token) {
    return <div className="text-gray-400 text-sm">Loading impact analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neon-green mb-1">Impact</h1>
        <p className="text-sm text-gray-400">
          Track carbon impact from GreenFi NFTs and see the top contributing wallets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-neon-green/20 bg-black/60 p-4 text-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-neon-green text-sm">Impact leaderboard</div>
            <span className="text-[11px] text-gray-500">Top {leaderboard.length} wallets</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-black/80 text-gray-400 text-[11px] uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Rank</th>
                  <th className="px-3 py-2 text-left">Wallet</th>
                  <th className="px-3 py-2 text-left">tCO2</th>
                  <th className="px-3 py-2 text-left">NFTs</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((e, idx) => (
                  <tr key={e.walletAddress} className="border-t border-gray-800 hover:bg-neon-green/5">
                    <td className="px-3 py-2 text-gray-400">#{idx + 1}</td>
                    <td className="px-3 py-2 text-xs text-gray-200 font-mono">
                      {e.walletAddress.slice(0, 8)}...
                    </td>
                    <td className="px-3 py-2 text-neon-green">{e.totalCarbonOffset.toFixed(3)}</td>
                    <td className="px-3 py-2 text-gray-200">{e.nfts}</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-[11px] text-gray-500">
                      No impact data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-neon-green/20 bg-black/60 p-4 text-xs flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="font-semibold text-neon-green text-sm">Inspect wallet impact</div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="Wallet address"
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
              />
              <button
                onClick={handleLookup}
                disabled={loadingUser}
                className="px-3 py-1 rounded-full bg-neon-green text-black text-xs font-semibold hover:bg-neon-green/90 disabled:opacity-60"
              >
                {loadingUser ? "Loading..." : "Lookup"}
              </button>
            </div>
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}

          {userImpact && (
            <div className="space-y-3">
              <div className="text-[11px] text-gray-400">
                Wallet <span className="font-mono text-gray-200">{userImpact.wallet}</span> has generated
                <span className="text-neon-green"> {userImpact.totalCarbonOffset.toFixed(3)}</span> tCO2 across
                <span className="text-neon-green"> {userImpact.nfts.length}</span> NFTs.
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-800 bg-black/60">
                <table className="min-w-full text-[11px]">
                  <thead className="bg-black/80 text-gray-400 uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">NFT ID</th>
                      <th className="px-3 py-2 text-left">Project</th>
                      <th className="px-3 py-2 text-left">tCO2</th>
                      <th className="px-3 py-2 text-left">Minted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userImpact.nfts.map((n) => (
                      <tr key={n.id} className="border-t border-gray-800">
                        <td className="px-3 py-2 text-gray-200 font-mono text-[10px]">
                          {n.id}
                        </td>
                        <td className="px-3 py-2 text-gray-300 text-[11px]">{n.projectId || "-"}</td>
                        <td className="px-3 py-2 text-neon-green">
                          {n.carbonOffset != null ? n.carbonOffset.toFixed(3) : "-"}
                        </td>
                        <td className="px-3 py-2 text-gray-500">
                          {n.createdAt ? new Date(n.createdAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))}
                    {userImpact.nfts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-[11px] text-gray-500">
                          No NFTs found for this wallet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-neon-green/20 bg-black/60 p-4 text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="font-semibold text-neon-green text-sm">Mint impact NFT (admin)</div>
          {mintSuccess && <span className="text-[11px] text-neon-green truncate max-w-xs">{mintSuccess}</span>}
        </div>
        {mintError && <p className="text-[11px] text-red-400">{mintError}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={mintWallet}
            onChange={(e) => setMintWallet(e.target.value)}
            placeholder="Wallet address"
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
          />
          <input
            value={mintProject}
            onChange={(e) => setMintProject(e.target.value)}
            placeholder="Project name / ID"
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
          />
          <input
            value={mintDate}
            onChange={(e) => setMintDate(e.target.value)}
            placeholder="Date (e.g. 2025-01-01)"
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={mintTier}
            onChange={(e) => setMintTier(e.target.value)}
            placeholder="Badge tier (Seed / Forest / Guardian)"
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
          />
          <input
            value={mintCarbon}
            onChange={(e) => setMintCarbon(e.target.value)}
            placeholder="Carbon tCO2 (e.g. 1.5)"
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
          />
          <input
            value={mintTokenURI}
            onChange={(e) => setMintTokenURI(e.target.value)}
            placeholder="Token URI (optional)"
            className="px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleMint}
            disabled={minting}
            className="px-4 py-1.5 rounded-full bg-neon-green text-black text-xs font-semibold hover:bg-neon-green/90 disabled:opacity-60"
          >
            {minting ? "Minting..." : "Mint NFT"}
          </button>
        </div>
      </div>
    </div>
  );
}
