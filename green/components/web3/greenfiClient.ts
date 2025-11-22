"use client";

import { useMemo } from "react";
import { ethers } from "ethers";

const GREENFI_CORE_ABI = [
  "function aprBps() view returns (uint256)",
  "function lockPeriod() view returns (uint256)",
  "function minStakeAmount() view returns (uint256)",
  "function stakes(address) view returns (uint256 amount, uint256 rewardDebt, uint256 lastUpdated, uint256 startTime)",
  "function pendingReward(address) view returns (uint256)",
  "function stake(uint256 _amount)",
  "function claimReward()",
  "function unstake(uint256 _amount)",
];

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export function useGreenfiContracts(signer: ethers.Signer | null) {
  const coreAddress = process.env.NEXT_PUBLIC_GREENFI_CORE_ADDRESS;
  const tokenAddress = process.env.NEXT_PUBLIC_STAKING_TOKEN_ADDRESS;

  const core = useMemo(() => {
    if (!signer || !coreAddress) return null;
    return new ethers.Contract(coreAddress, GREENFI_CORE_ABI, signer);
  }, [signer, coreAddress]);

  const token = useMemo(() => {
    if (!signer || !tokenAddress) return null;
    return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  }, [signer, tokenAddress]);

  return { core, token };
}
