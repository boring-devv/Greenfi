import { ethers } from 'ethers';

const GREENFI_CORE_ABI = [
  // Views
  'function aprBps() view returns (uint256)',
  'function lockPeriod() view returns (uint256)',
  'function stakes(address) view returns (uint256 amount, uint256 rewardDebt, uint256 lastUpdated, uint256 startTime)',
  'function pendingReward(address) view returns (uint256)',
  // Admin / actions
  'function mintImpactNFTForUser(address _user, uint256 _carbonOffset, string _projectName, string _date, string _badgeTier, string _tokenURI) returns (uint256)',
  // Events
  'event MintImpactNFT(address indexed user, uint256 indexed tokenId, uint256 carbonOffset, string projectName, string date, string badgeTier)',
];

let cachedProvider: ethers.JsonRpcProvider | null = null;

export function getJsonRpcProvider(): ethers.JsonRpcProvider | null {
  const rpcUrl = process.env.HEDERA_RPC_URL;
  if (!rpcUrl) {
    return null;
  }
  if (!cachedProvider) {
    cachedProvider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return cachedProvider;
}

export function getGreenFiCoreReadContract(): ethers.Contract | null {
  const address = process.env.GREENFI_CORE_ADDRESS;
  const provider = getJsonRpcProvider();
  if (!address || !provider) {
    return null;
  }
  return new ethers.Contract(address, GREENFI_CORE_ABI, provider);
}

export function getGreenFiCoreWithSigner(): ethers.Contract | null {
  const address = process.env.GREENFI_CORE_ADDRESS;
  const provider = getJsonRpcProvider();
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  if (!address || !provider || !privateKey) {
    return null;
  }
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(address, GREENFI_CORE_ABI, wallet);
}
