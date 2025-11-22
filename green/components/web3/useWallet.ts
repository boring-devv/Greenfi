"use client";

import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";

const HEDERA_TESTNET_CHAIN_ID_HEX = "0x128"; // 296

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainOk, setChainOk] = useState<boolean>(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum;
    if (eth) {
      const injected = Array.isArray(eth.providers)
        ? eth.providers.find((p: any) => p.isMetaMask) ?? eth.providers[0]
        : eth;
      const p = new ethers.BrowserProvider(injected);
      setProvider(p);
    }
  }, []);

  const refreshConnectionState = useCallback(
    async (prov: ethers.BrowserProvider) => {
      try {
        const network = await prov.getNetwork();
        setChainOk(Number(network.chainId) === 296);
        const accounts = await prov.listAccounts();
        if (accounts.length > 0) {
          const s = await prov.getSigner();
          setSigner(s);
          setAddress(accounts[0].address);
        }
      } catch {
        setSigner(null);
        setAddress(null);
        setChainOk(false);
      }
    },
    [],
  );

  const connect = useCallback(async () => {
    if (!provider) {
      setError("No EVM wallet detected. Please install MetaMask or HashPack with EVM support.");
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      await (provider as any).send("eth_requestAccounts", []);
      await refreshConnectionState(provider);
    } catch (err: any) {
      setError(err?.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }, [provider, refreshConnectionState]);

  return { provider, signer, address, chainOk, connecting, error, connect };
}
