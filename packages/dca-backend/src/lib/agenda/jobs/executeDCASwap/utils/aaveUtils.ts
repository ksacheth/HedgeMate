import { ethers } from 'ethers';

import { AAVE_POOL_ABI, AAVE_POOL_ADDRESS_SEPOLIA, USDC_ADDRESS_SEPOLIA } from './constants';

export const getProvider = (chainId: number) => {
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyApiKey) {
    throw new Error('ALCHEMY_API_KEY not found in environment variables');
  }

  return new ethers.providers.AlchemyProvider(chainId, alchemyApiKey);
};

export const getSigner = (chainId: number) => {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not found in environment variables');
  }

  const provider = getProvider(chainId);
  return new ethers.Wallet(privateKey, provider);
};

export async function checkHealthFactor(userAddress: string): Promise<number> {
  const provider = getProvider(11155111);
  const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS_SEPOLIA, AAVE_POOL_ABI, provider);

  const userData = await aavePool.getUserAccountData(userAddress);

  // The health factor is a large number with 18 decimals, so we format it
  const healthFactor = parseFloat(ethers.utils.formatEther(userData.healthFactor));
  return healthFactor;
}

export async function executeAaveRepay(userAddress: string, repayAmount: string): Promise<string> {
  // Use the backend's wallet to send the transaction
  const signer = getSigner(11155111);
  const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS_SEPOLIA, AAVE_POOL_ABI, signer);

  const amountInWei = ethers.utils.parseUnits(repayAmount, 6);

  const tx = await aavePool.repay(USDC_ADDRESS_SEPOLIA, amountInWei, 2, userAddress);
  await tx.wait();
  return tx.hash;
}
