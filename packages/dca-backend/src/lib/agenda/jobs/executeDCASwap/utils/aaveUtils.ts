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
  try {
    const provider = getProvider(11155111);
    const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS_SEPOLIA, AAVE_POOL_ABI, provider);

    const userData = await aavePool.getUserAccountData(userAddress);

    // The health factor is a large number with 18 decimals, so we format it
    const healthFactor = parseFloat(ethers.utils.formatEther(userData.healthFactor));
    return healthFactor;
  } catch (error) {
    throw new Error(`Failed to fetch health factor for ${userAddress}: ${error}`);
  }
}

export async function executeAaveRepay(userAddress: string, repayAmount: string): Promise<string> {
  // IMPORTANT: This implementation assumes the backend wallet has the necessary USDC
  // to perform the repayment on behalf of the user.
  //
  // In a production system, there are two main approaches:
  // 1. User pre-approves the backend address to spend their USDC, and the backend
  //    uses transferFrom + repay in a single transaction
  // 2. Backend has a pool of USDC and performs the repayment, then gets reimbursed
  //    by transferring from the user's address (requires prior approval)
  //
  // Current implementation: Backend uses its own USDC to repay user's debt
  // This requires the backend to have sufficient USDC balance

  try {
    const signer = getSigner(11155111);
    const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS_SEPOLIA, AAVE_POOL_ABI, signer);

    // Check and approve AAVE to spend backend's USDC if needed
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS_SEPOLIA,
      [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)',
      ],
      signer
    );

    const amountInWei = ethers.utils.parseUnits(repayAmount, 6); // USDC has 6 decimals

    // Check current allowance
    const currentAllowance = await usdcContract.allowance(
      signer.address,
      AAVE_POOL_ADDRESS_SEPOLIA
    );

    // Only approve if current allowance is insufficient
    if (currentAllowance.lt(amountInWei)) {
      // Approve max uint256 to avoid future approval transactions
      const approveTx = await usdcContract.approve(
        AAVE_POOL_ADDRESS_SEPOLIA,
        ethers.constants.MaxUint256
      );
      await approveTx.wait();
    }

    // Repay the user's debt using backend's USDC
    // Parameters: asset, amount, interestRateMode (2 = variable), onBehalfOf (user)
    const tx = await aavePool.repay(USDC_ADDRESS_SEPOLIA, amountInWei, 2, userAddress);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    throw new Error(`Failed to execute AAVE repayment for ${userAddress}: ${error}`);
  }
}
