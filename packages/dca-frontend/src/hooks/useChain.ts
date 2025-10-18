import { useState } from 'react';
import { LIT_EVM_CHAINS } from '@lit-protocol/constants';
import { LITEVMChain } from '@lit-protocol/types';
import { ethers } from 'ethers';

const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)'];

const WETH_CONTRACT_ADDRESSES: Record<number, string> = {
  [LIT_EVM_CHAINS.sepolia.chainId]: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
};

const USDC_CONTRACT_ADDRESSES: Record<number, string> = {
  [LIT_EVM_CHAINS.sepolia.chainId]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
};

export const useChain = () => {
  const [chain, setChain] = useState<LITEVMChain>(LIT_EVM_CHAINS.sepolia);

  const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrls[0]);

  const usdcContract = new ethers.Contract(
    USDC_CONTRACT_ADDRESSES[chain.chainId],
    ERC20_ABI,
    provider
  );

  const wethContract = new ethers.Contract(
    WETH_CONTRACT_ADDRESSES[chain.chainId],
    ERC20_ABI,
    provider
  );

  return {
    chain,
    setChain,
    provider,
    usdcContract,
    wethContract,
  };
};
