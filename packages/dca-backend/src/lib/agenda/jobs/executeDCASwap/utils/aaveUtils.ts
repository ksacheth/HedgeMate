import consola from 'consola';
import { ethers } from 'ethers';

import { alchemyGasSponsor, alchemyGasSponsorApiKey, alchemyGasSponsorPolicyId } from './alchemy';
import { AAVE_POOL_ABI, AAVE_POOL_ADDRESS_SEPOLIA, USDC_ADDRESS_SEPOLIA } from './constants';
import { handleOperationExecution } from './handle-operation-execution';
import { env } from '../../../../env';
import { getErc20ApprovalToolClient } from '../vincentAbilities';

const { ALCHEMY_API_KEY } = env;

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const sepoliaProvider = new ethers.providers.AlchemyProvider(SEPOLIA_CHAIN_ID, ALCHEMY_API_KEY);

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
  const provider = getProvider(SEPOLIA_CHAIN_ID);
  const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS_SEPOLIA, AAVE_POOL_ABI, provider);

  const userData = await aavePool.getUserAccountData(userAddress);

  // The health factor is a large number with 18 decimals, so we format it
  const healthFactor = parseFloat(ethers.utils.formatEther(userData.healthFactor));
  return healthFactor;
}

export async function executeAaveRepay({
  onBehalfOf,
  pkpEthAddress,
  pkpPublicKey,
  repayAmount,
}: {
  onBehalfOf: string;
  pkpEthAddress: `0x${string}`;
  pkpPublicKey: string;
  repayAmount: string;
}): Promise<string> {
  consola.log('Starting Aave repay...', {
    onBehalfOf,
    pkpEthAddress,
    repayAmount,
  });

  const amountInWei = ethers.utils.parseUnits(repayAmount, 6);

  // Step 1: Approve USDC to Aave Pool using ERC20 approval ability
  consola.debug('Approving USDC to Aave Pool...');
  const erc20ApprovalToolClient = getErc20ApprovalToolClient();
  const approvalParams = {
    alchemyGasSponsor,
    alchemyGasSponsorApiKey,
    alchemyGasSponsorPolicyId,
    chainId: SEPOLIA_CHAIN_ID,
    rpcUrl: SEPOLIA_RPC_URL,
    spenderAddress: AAVE_POOL_ADDRESS_SEPOLIA,
    tokenAddress: USDC_ADDRESS_SEPOLIA,
    tokenAmount: amountInWei.toString(),
  };
  const approvalContext = {
    delegatorPkpEthAddress: pkpEthAddress,
  };

  // Check if approval is needed
  const approvalPrecheckResult = await erc20ApprovalToolClient.precheck(
    approvalParams,
    approvalContext
  );
  if (!approvalPrecheckResult.success) {
    throw new Error(`ERC20 approval tool precheck failed: ${approvalPrecheckResult}`);
  }

  // Send approval tx if needed
  if (!approvalPrecheckResult.result.alreadyApproved) {
    consola.debug('Sending approval transaction...');
    const approvalExecutionResult = await erc20ApprovalToolClient.execute(
      approvalParams,
      approvalContext
    );
    consola.trace('ERC20 Approval Vincent Tool Response:', approvalExecutionResult);
    if (!approvalExecutionResult.success) {
      throw new Error(`ERC20 approval tool execution failed: ${approvalExecutionResult}`);
    }

    const approvalHash = approvalExecutionResult.result.approvalTxHash as `0x${string}`;
    consola.debug('Approval hash:', approvalHash);

    // Wait for approval to be mined
    await handleOperationExecution({
      pkpPublicKey,
      isSponsored: alchemyGasSponsor,
      operationHash: approvalHash,
      provider: sepoliaProvider,
    });
    consola.debug('Approval transaction mined');
  } else {
    consola.debug('Approval already exists, skipping approval transaction');
  }

  // Step 2: Execute repay transaction
  // NOTE: This requires creating a custom Vincent ability for Aave repay
  // For now, we'll prepare the calldata but throw an informative error

  consola.debug('Preparing repay transaction...');

  // Encode the repay function call
  const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS_SEPOLIA, AAVE_POOL_ABI, sepoliaProvider);
  const repayCalldata = aavePool.interface.encodeFunctionData('repay', [
    USDC_ADDRESS_SEPOLIA, // Asset to repay (USDC)
    amountInWei, // Amount to repay
    2, // Variable rate mode
    onBehalfOf, // MetaMask wallet whose debt to repay
  ]);

  consola.debug('Repay calldata prepared:', {
    repayAmount,
    debtOwner: onBehalfOf,
    payer: pkpEthAddress,
  });

  consola.error('Aave repay via PKP requires a custom Vincent ability');

  const approvalStatus = approvalPrecheckResult.result.alreadyApproved
    ? 'already set'
    : 'just completed';

  throw new Error(
    `PKP-signed Aave repay is not yet fully implemented.

Flow:
- PKP Wallet (${pkpEthAddress}) will pay the USDC
- MetaMask Wallet (${onBehalfOf}) will have their debt reduced
- Approval was ${approvalStatus}

To complete this implementation, you need to:
1. Create a custom Vincent ability for Aave repay (similar to @lit-protocol/vincent-ability-erc20-approval)
2. Or use the @lit-protocol/vincent-scaffold-sdk to create a generic contract interaction ability
3. The approval step above works correctly with PKP signing

Requirements:
- PKP wallet needs USDC (${repayAmount}) and ETH for gas on Sepolia
- Repay calldata is ready: ${repayCalldata.slice(0, 20)}...
- Next: implement the repay transaction execution with PKP signature`
  );
}
