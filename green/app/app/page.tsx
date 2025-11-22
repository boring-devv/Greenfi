"use client";

import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/components/web3/useWallet";
import { useGreenfiContracts } from "@/components/web3/greenfiClient";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

interface UserImpactResponse {
  totalCarbonOffset: number;
  nfts: {
    id: string;
    projectId?: string;
    carbonOffset: number;
    date?: string;
    badgeTier?: string;
  }[];
}

interface ProjectRow {
  id: string;
  projectName: string;
  location?: string;
  description?: string;
  fundsRaised?: number;
  impactScore?: number;
  status?: string;
}

export default function GreenFiAppPage() {
  const { provider, signer, address, chainOk, connecting, error: walletError, connect } = useWallet();
  const { core, token } = useGreenfiContracts(signer as ethers.Signer | null);

  const [loadingOnchain, setLoadingOnchain] = useState(false);
  const [stakeApr, setStakeApr] = useState<number | null>(null);
  const [lockDays, setLockDays] = useState<number | null>(null);
  const [minStake, setMinStake] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [balance, setBalance] = useState<string>("0");
  const [staked, setStaked] = useState<string>("0");
  const [pendingReward, setPendingReward] = useState<string>("0");
  const [stakeInput, setStakeInput] = useState("0");
  const [unstakeInput, setUnstakeInput] = useState("0");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const [impact, setImpact] = useState<UserImpactResponse | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loadingImpact, setLoadingImpact] = useState(false);

  const loadOnchain = useCallback(async () => {
    if (!core || !token || !address) return;
    try {
      setLoadingOnchain(true);
      setTxError(null);

      const [aprBps, lockSeconds, minStakeAmount, stakeInfo, pending, decimals, symbol, bal] =
        await Promise.all([
          core.aprBps(),
          core.lockPeriod(),
          core.minStakeAmount(),
          core.stakes(address),
          core.pendingReward(address),
          token.decimals(),
          token.symbol(),
          token.balanceOf(address),
        ]);

      const apr = Number(aprBps) / 100;
      const lock = Number(lockSeconds) / (24 * 60 * 60);
      const dec = Number(decimals);

      const stakedAmount = (stakeInfo.amount ?? BigInt(0)) as bigint;
      const rewardDebt = (stakeInfo.rewardDebt ?? BigInt(0)) as bigint;
      const pendingTotal = (pending as bigint) + rewardDebt;

      setStakeApr(apr);
      setLockDays(lock);
      setMinStake(ethers.formatUnits(minStakeAmount, dec));
      setTokenDecimals(dec);
      setTokenSymbol(symbol);
      setBalance(ethers.formatUnits(bal, dec));
      setStaked(ethers.formatUnits(stakedAmount, dec));
      setPendingReward(ethers.formatUnits(pendingTotal, dec));
    } catch (err: any) {
      console.error("Error loading onchain state", err);
      setTxError(err?.message || "Failed to load on-chain state");
    } finally {
      setLoadingOnchain(false);
    }
  }, [core, token, address]);

  useEffect(() => {
    if (core && token && address) {
      loadOnchain();
    }
  }, [core, token, address, loadOnchain]);

  useEffect(() => {
    const fetchImpactAndProjects = async () => {
      if (!address) return;
      setLoadingImpact(true);
      try {
        const [impactRes, projRes] = await Promise.all([
          fetch(`${API_BASE}/impact/user/${encodeURIComponent(address)}`),
          fetch(`${API_BASE}/projects`),
        ]);

        if (impactRes.ok) {
          const impactData = (await impactRes.json()) as UserImpactResponse;
          setImpact(impactData);
        } else {
          setImpact(null);
        }

        if (projRes.ok) {
          const projData = (await projRes.json()) as { projects: ProjectRow[] };
          setProjects(projData.projects || []);
        }
      } catch (err) {
        console.error("Error loading impact/projects", err);
      } finally {
        setLoadingImpact(false);
      }
    };

    fetchImpactAndProjects();
  }, [address]);

  const performStake = async () => {
    if (!core || !token || !address) {
      toast.error("Wallet not connected");
      return;
    }
    
    const loadingToast = toast.loading("Processing stake...");
    
    try {
      const amount = stakeInput.trim();
      if (!amount || Number(amount) <= 0) {
        toast.error("Please enter a positive stake amount");
        return;
      }
      
      const amountWei = ethers.parseUnits(amount, tokenDecimals);

      // Ensure allowance
      const allowance = (await token.allowance(address, core.target)) as bigint;
      if (allowance < amountWei) {
        toast.loading("Approving token transfer...", { id: loadingToast });
        const approveTx = await token.approve(core.target, amountWei);
        await approveTx.wait();
        toast.success("Token transfer approved!");
      }

      toast.loading("Confirming stake...", { id: loadingToast });
      const tx = await core.stake(amountWei);
      await tx.wait();
      
      toast.success(`Successfully staked ${amount} ${tokenSymbol || 'tokens'}!`, { id: loadingToast });
      await loadOnchain();
      setStakeInput("");
    } catch (err: any) {
      console.error("Stake error", err);
      const errorMessage = err?.reason || err?.message || "Stake failed";
      toast.error(`Staking failed: ${errorMessage}`, { id: loadingToast });
    }
  };

  const performClaim = async () => {
    if (!core) {
      toast.error("Wallet not connected");
      return;
    }
    
    const loadingToast = toast.loading("Claiming rewards...");
    
    try {
      const tx = await core.claimReward();
      await tx.wait();
      toast.success("Rewards claimed successfully!", { id: loadingToast });
      await loadOnchain();
    } catch (err: any) {
      console.error("Claim error", err);
      const errorMessage = err?.reason || err?.message || "Claim failed";
      toast.error(`Failed to claim rewards: ${errorMessage}`, { id: loadingToast });
    }
  };

  const performUnstake = async () => {
    if (!core) {
      toast.error("Wallet not connected");
      return;
    }
    
    const loadingToast = toast.loading("Processing unstake...");
    
    try {
      const amount = unstakeInput.trim();
      if (!amount || Number(amount) <= 0) {
        toast.error("Please enter a positive amount to unstake");
        return;
      }
      
      const amountWei = ethers.parseUnits(amount, tokenDecimals);
      toast.loading("Confirming unstake...", { id: loadingToast });
      
      const tx = await core.unstake(amountWei);
      await tx.wait();
      
      toast.success(`Successfully unstaked ${amount} ${tokenSymbol || 'tokens'}!`, { id: loadingToast });
      await loadOnchain();
      setUnstakeInput("");
    } catch (err: any) {
      console.error("Unstake error", err);
      const errorMessage = err?.reason || err?.message || "Unstake failed";
      toast.error(`Unstake failed: ${errorMessage}`, { id: loadingToast });
    }
  };

  const walletStatus = () => {
    if (!provider) return "No wallet detected";
    if (!address) return "Wallet not connected";
    if (!chainOk) return "Wrong network (switch to Hedera Testnet)";
    return "Wallet connected";
  };

  return (
    <main className="min-h-screen bg-black text-gray-50 pt-20 pb-16 px-4">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #2d3748',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#0f172a',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#0f172a',
            },
          },
          loading: {
            iconTheme: {
              primary: '#60a5fa',
              secondary: '#0f172a',
            },
          },
        }}
      />
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold text-neon-green">GreenFi App</h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Connect your wallet on Hedera Testnet to stake tokens, earn rewards, and see your climate impact.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-neon-green/30 bg-black/70 p-4 space-y-2">
            <div className="text-gray-400 text-[11px] uppercase tracking-wide">Wallet</div>
            <div className="text-sm font-mono break-all">{address || "Not connected"}</div>
            <div className="text-[11px] text-gray-400">Status: {walletStatus()}</div>
            {(walletError || !chainOk) && (
              <div className="text-[11px] text-red-400 mt-1">{walletError || "Please switch to Hedera Testnet (296)."}</div>
            )}
            <Button
              size="sm"
              onClick={connect}
              disabled={connecting}
              className="mt-2 text-xs px-3 py-1.5 rounded-full bg-neon-green text-black hover:bg-neon-green/90 disabled:opacity-60"
            >
              {connecting ? "Connecting..." : address ? "Reconnect" : "Connect Wallet"}
            </Button>
          </div>

          <div className="rounded-xl border border-neon-green/20 bg-black/70 p-4 space-y-1">
            <div className="text-gray-400 text-[11px] uppercase tracking-wide">Staking APR</div>
            <div className="text-lg font-semibold text-neon-green">
              {stakeApr !== null ? `${stakeApr.toFixed(2)}%` : "-"}
            </div>
            <div className="text-[11px] text-gray-500">Lock period: {lockDays ? `${lockDays} days` : "None"}</div>
            <div className="text-[11px] text-gray-500">
              Min stake: {minStake && tokenSymbol ? `${minStake} ${tokenSymbol}` : "-"}
            </div>
          </div>

          <div className="rounded-xl border border-neon-green/20 bg-black/70 p-4 space-y-1">
            <div className="text-gray-400 text-[11px] uppercase tracking-wide">Your balances</div>
            <div className="text-[11px] text-gray-400">
              Wallet: <span className="text-neon-green">{balance}</span> {tokenSymbol || "TOKEN"}
            </div>
            <div className="text-[11px] text-gray-400">
              Staked: <span className="text-neon-green">{staked}</span>
            </div>
            <div className="text-[11px] text-gray-400">
              Pending rewards: <span className="text-neon-green">{pendingReward}</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-neon-green/20 bg-black/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-neon-green text-sm">Stake tokens</div>
              {loadingOnchain && <div className="text-[11px] text-gray-400">Refreshing...</div>}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-gray-400">
                Amount to stake
                <input
                  value={stakeInput}
                  onChange={(e) => setStakeInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
                  placeholder="0.0"
                />
              </label>
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  disabled={!core || !token || !address}
                  onClick={performStake}
                  className="px-3 py-1.5 rounded-full bg-neon-green text-black text-xs font-semibold hover:bg-neon-green/90 disabled:opacity-50"
                >
                  Stake
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neon-green/20 bg-black/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-neon-green text-sm">Manage stake</div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-gray-400">
                Amount to unstake
                <input
                  value={unstakeInput}
                  onChange={(e) => setUnstakeInput(e.target.value)}
                  className="mt-1 w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neon-green/30 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-neon-green"
                  placeholder="0.0"
                />
              </label>
              <div className="flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  disabled={!core || !address}
                  onClick={performClaim}
                  className="px-3 py-1.5 rounded-full border border-neon-green/60 text-neon-green text-xs font-semibold hover:bg-neon-green/10 disabled:opacity-50"
                >
                  Claim rewards
                </Button>
                <Button
                  size="sm"
                  disabled={!core || !address}
                  onClick={performUnstake}
                  className="px-3 py-1.5 rounded-full bg-red-500/80 text-black text-xs font-semibold hover:bg-red-500 disabled:opacity-50"
                >
                  Unstake
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-neon-green/20 bg-black/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-neon-green text-sm">Your impact</div>
              {loadingImpact && <div className="text-[11px] text-gray-400">Loading...</div>}
            </div>
            <p className="text-[11px] text-gray-400">
              Total carbon offset: <span className="text-neon-green">{impact?.totalCarbonOffset ?? 0}</span> tCO2
            </p>
            <div className="max-h-56 overflow-y-auto space-y-2">
              {impact?.nfts?.length ? (
                impact.nfts.map((nft) => (
                  <div
                    key={nft.id}
                    className="rounded-lg border border-neon-green/20 bg-black/60 px-3 py-2 flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-gray-300 font-mono">#{nft.id}</div>
                      <div className="text-[11px] text-gray-400">
                        {nft.projectId || "Project"} • {nft.date || "-"}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-neon-green">
                      {nft.carbonOffset} tCO2
                      {nft.badgeTier && <div className="text-[10px] text-gray-400">{nft.badgeTier}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-gray-500">No impact NFTs yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neon-green/20 bg-black/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-neon-green text-sm">Projects</div>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-2">
              {projects.length ? (
                projects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-neon-green/20 bg-black/60 px-3 py-2 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white font-semibold">{p.projectName}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 uppercase">
                        {p.status || "PENDING"}
                      </span>
                    </div>
                    {p.location && <div className="text-[11px] text-gray-400">{p.location}</div>}
                    {p.description && (
                      <div className="text-[11px] text-gray-500 line-clamp-2">{p.description}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-gray-500">No projects available yet.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
