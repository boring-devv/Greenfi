import { firestore } from '../config/firebase';
import { v4 as uuid } from 'uuid';
import { ethers } from 'ethers';
import { getGreenFiCoreReadContract } from '../web3/greenfiContracts';

if (!firestore) {
  throw new Error('Firestore not initialized');
}

const stakingCollection = firestore.collection('staking');

export interface StakeRecord {
  id: string;
  walletAddress: string;
  amount: number;
  rewards: number;
  status: 'ACTIVE' | 'CLAIMED' | 'WITHDRAWN';
  createdAt: string;
  updatedAt: string;
  lastClaimAt?: string;
}

const DEFAULT_APR = Number(process.env.STAKE_APR || '12');
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

function calculateRewards(amount: number, createdAt: string, lastClaimAt?: string): number {
  const from = new Date(lastClaimAt || createdAt).getTime();
  const now = Date.now();
  const seconds = Math.max(0, (now - from) / 1000);
  return (amount * (DEFAULT_APR / 100) * seconds) / SECONDS_PER_YEAR;
}

export async function getStakeRate() {
  try {
    const core = getGreenFiCoreReadContract();
    if (!core) {
      return {
        apr: DEFAULT_APR,
        lockDays: Number(process.env.STAKE_LOCK_DAYS || '0'),
      };
    }

    const [aprBps, lockSeconds] = await Promise.all([
      core.aprBps(),
      core.lockPeriod(),
    ]);

    const apr = Number(aprBps) / 100; // basis points -> percent
    const lockDays = Number(lockSeconds) / (24 * 60 * 60);

    return { apr, lockDays };
  } catch (err) {
    console.error('getStakeRate on-chain fallback error', err);
    return {
      apr: DEFAULT_APR,
      lockDays: Number(process.env.STAKE_LOCK_DAYS || '0'),
    };
  }
}

export async function getWalletStakes(walletAddress: string) {
  const wallet = walletAddress.toLowerCase();

  try {
    const core = getGreenFiCoreReadContract();
    if (!core) {
      throw new Error('Core contract not configured');
    }

    const [stakeInfo, pendingRewardWei] = await Promise.all([
      core.stakes(wallet),
      core.pendingReward(wallet),
    ]);

    const amountWei = stakeInfo.amount as bigint;
    const rewardDebtWei = stakeInfo.rewardDebt as bigint;
    const lastUpdatedSec = Number(stakeInfo.lastUpdated || 0n);
    const startTimeSec = Number(stakeInfo.startTime || 0n);

    const hasStake = amountWei > 0n;

    if (!hasStake) {
      return { stakes: [], totalStaked: 0, totalRewardsAccrued: 0 };
    }

    const amount = Number(ethers.formatEther(amountWei));
    const totalRewardWei = (pendingRewardWei as bigint) + rewardDebtWei;
    const rewards = Number(ethers.formatEther(totalRewardWei));

    const createdAt = startTimeSec
      ? new Date(startTimeSec * 1000).toISOString()
      : new Date(0).toISOString();
    const updatedAt = lastUpdatedSec
      ? new Date(lastUpdatedSec * 1000).toISOString()
      : createdAt;

    const stake: StakeRecord = {
      id: wallet,
      walletAddress: wallet,
      amount,
      rewards,
      status: 'ACTIVE',
      createdAt,
      updatedAt,
    };

    return {
      stakes: [stake],
      totalStaked: amount,
      totalRewardsAccrued: rewards,
    };
  } catch (err) {
    console.error('getWalletStakes on-chain error, falling back to Firestore', err);

    const snap = await stakingCollection.where('walletAddress', '==', wallet).get();
    const stakes: StakeRecord[] = [];
    let totalStaked = 0;
    let totalRewardsAccrued = 0;

    snap.forEach((doc) => {
      const data = doc.data() as StakeRecord;
      const stake: StakeRecord = { id: doc.id, ...data };
      stakes.push(stake);
      totalStaked += stake.amount || 0;
      totalRewardsAccrued += stake.rewards || 0;
    });

    return { stakes, totalStaked, totalRewardsAccrued };
  }
}

export interface InitiateStakeInput {
  walletAddress: string;
  amount: number;
}

export async function initiateStake(input: InitiateStakeInput): Promise<StakeRecord> {
  const id = uuid();
  const now = new Date().toISOString();

  const stake: StakeRecord = {
    id,
    walletAddress: input.walletAddress.toLowerCase(),
    amount: input.amount,
    rewards: 0,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };

  const cleanStake = Object.fromEntries(
    Object.entries(stake).filter(([, value]) => value !== undefined)
  ) as StakeRecord;

  await stakingCollection.doc(id).set(cleanStake);
  return cleanStake;
}

export async function claimStakeRewards(id: string): Promise<StakeRecord | null> {
  const docRef = stakingCollection.doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;

  const data = snap.data() as StakeRecord;
  const now = new Date().toISOString();
  const additionalRewards = calculateRewards(data.amount, data.createdAt, data.lastClaimAt);
  const rewards = (data.rewards || 0) + additionalRewards;

  await docRef.update({ rewards, lastClaimAt: now, updatedAt: now });
  const updated = await docRef.get();
  return { id: updated.id, ...(updated.data() as StakeRecord) };
}

export async function withdrawStake(id: string): Promise<StakeRecord | null> {
  const docRef = stakingCollection.doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;

  const data = snap.data() as StakeRecord;
  const now = new Date().toISOString();

  await docRef.update({ status: 'WITHDRAWN', updatedAt: now });
  const updated = await docRef.get();
  return { id: updated.id, ...(updated.data() as StakeRecord) };
}
