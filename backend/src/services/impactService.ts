import { firestore } from '../config/firebase';

if (!firestore) {
  throw new Error('Firestore not initialized');
}

const nftsCollection = firestore.collection('impact_nfts');

export interface ImpactNFTRecord {
  id: string;
  walletAddress: string;
  projectId?: string;
  carbonOffset?: number;
  createdAt: string;
}

export async function getUserImpact(walletAddress: string) {
  const wallet = walletAddress.toLowerCase();
  const snap = await nftsCollection.where('walletAddress', '==', wallet).get();
  const nfts: ImpactNFTRecord[] = [];
  let totalCarbonOffset = 0;

  snap.forEach((doc) => {
    const data = doc.data() as ImpactNFTRecord;
    const record: ImpactNFTRecord = { id: doc.id, ...data };
    nfts.push(record);
    totalCarbonOffset += Number(record.carbonOffset || 0);
  });

  return { wallet, totalCarbonOffset, nfts };
}

export async function getImpactLeaderboard(limit = 20) {
  const snap = await nftsCollection.get();
  const byWallet: Record<string, { walletAddress: string; totalCarbonOffset: number; nfts: number }> = {};

  snap.forEach((doc) => {
    const data = doc.data() as ImpactNFTRecord;
    const wallet = data.walletAddress?.toLowerCase();
    if (!wallet) return;
    const carbon = Number(data.carbonOffset || 0);
    if (!byWallet[wallet]) {
      byWallet[wallet] = { walletAddress: wallet, totalCarbonOffset: 0, nfts: 0 };
    }
    byWallet[wallet].totalCarbonOffset += carbon;
    byWallet[wallet].nfts += 1;
  });

  const leaderboard = Object.values(byWallet).sort(
    (a, b) => b.totalCarbonOffset - a.totalCarbonOffset
  );

  return leaderboard.slice(0, limit);
}

export async function getProjectImpact(projectId: string) {
  const snap = await nftsCollection.where('projectId', '==', projectId).get();
  const nfts: ImpactNFTRecord[] = [];
  let totalCarbonOffset = 0;

  snap.forEach((doc) => {
    const data = doc.data() as ImpactNFTRecord;
    const record: ImpactNFTRecord = { id: doc.id, ...data };
    nfts.push(record);
    totalCarbonOffset += Number(record.carbonOffset || 0);
  });

  return { projectId, totalCarbonOffset, nfts };
}
