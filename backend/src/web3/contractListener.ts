import { firestore } from '../config/firebase';
import { ethers } from 'ethers';
import { getJsonRpcProvider } from './greenfiContracts';

export async function startContractListener(): Promise<void> {
  if (!firestore) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('Skipping contract listener: Firestore not initialized');
    }
    return;
  }

  const coreAddress = process.env.GREENFI_CORE_ADDRESS;
  const provider = getJsonRpcProvider();

  if (!coreAddress || !provider) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('Skipping contract listener: GREENFI_CORE_ADDRESS or HEDERA_RPC_URL not set');
    }
    return;
  }

  const abi = [
    'event MintImpactNFT(address indexed user, uint256 indexed tokenId, uint256 carbonOffset, string projectName, string date, string badgeTier)',
  ];

  const contract = new ethers.Contract(coreAddress, abi, provider);
  const nftsCollection = firestore.collection('impact_nfts');
  const filter = contract.filters.MintImpactNFT();

  let lastProcessedBlock: number;
  try {
    lastProcessedBlock = await provider.getBlockNumber();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Unable to get current block number for contract listener', err);
    return;
  }

  async function poll() {
    try {
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = lastProcessedBlock + 1;

      if (latestBlock < fromBlock) {
        return;
      }

      const events = await contract.queryFilter(filter, fromBlock, latestBlock);

      for (const ev of events) {
        try {
          const args = ev.args as unknown as {
            user: string;
            tokenId: bigint;
            carbonOffset: bigint;
            projectName: string;
            date: string;
            badgeTier: string;
          };

          const wallet = args.user.toLowerCase();
          const carbon = Number(ethers.formatEther(args.carbonOffset));
          const docId = args.tokenId.toString();

          const record = {
            walletAddress: wallet,
            projectId: args.projectName,
            carbonOffset: carbon,
            createdAt: new Date().toISOString(),
            date: args.date,
            badgeTier: args.badgeTier,
          };

          await nftsCollection.doc(docId).set(record, { merge: true });

          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log('MintImpactNFT event synced for wallet', wallet, 'tokenId', docId);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error handling MintImpactNFT event', err);
        }
      }

      lastProcessedBlock = latestBlock;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error polling MintImpactNFT events', err);
    } finally {
      setTimeout(poll, 15000);
    }
  }

  // start polling loop (non-blocking)
  poll();

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('Contract listener polling GreenFiCore for MintImpactNFT events.');
  }
}
