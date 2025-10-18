import * as Sentry from '@sentry/node';
import { Job } from '@whisthub/agenda';
import consola from 'consola';
import { ethers } from 'ethers';

import { IRelayPKP } from '@lit-protocol/types';

import { type AppData, assertPermittedVersion } from '../jobVersion';
import {
  alchemyGasSponsor,
  alchemyGasSponsorApiKey,
  alchemyGasSponsorPolicyId,
  balanceOf,
  getERC20Contract,
  getUserPermittedVersion,
  handleOperationExecution,
} from './utils';
import {
  getErc20ApprovalToolClient,
  getSignedUniswapQuote,
  getUniswapToolClient,
} from './vincentAbilities';
import { env } from '../../../env';
import { normalizeError } from '../../../error';
import { PurchasedCoin } from '../../../mongo/models/PurchasedCoin';

export type JobType = Job<JobParams>;
export type JobParams = {
  app: AppData;
  name: string;
  pkpInfo: IRelayPKP;
  purchaseAmount: number;
  purchaseIntervalHuman: string;
  updatedAt: Date;
};

const { BASE_RPC_URL, VINCENT_APP_ID } = env;

const BASE_CHAIN_ID = 11155111;
const BASE_USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const BASE_WETH_ADDRESS = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';
const BASE_UNISWAP_V3_ROUTER = '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4';

const baseProvider = new ethers.providers.StaticJsonRpcProvider(BASE_RPC_URL);
const usdcContract = getERC20Contract(BASE_USDC_ADDRESS, baseProvider);

async function addUsdcApproval({
  ethAddress,
  usdcAmount,
}: {
  ethAddress: `0x${string}`;
  usdcAmount: ethers.BigNumber;
}): Promise<`0x${string}` | undefined> {
  const erc20ApprovalToolClient = getErc20ApprovalToolClient();
  const approvalParams = {
    alchemyGasSponsor,
    alchemyGasSponsorApiKey,
    alchemyGasSponsorPolicyId,
    chainId: BASE_CHAIN_ID,
    rpcUrl: BASE_RPC_URL,
    spenderAddress: BASE_UNISWAP_V3_ROUTER,
    tokenAddress: BASE_USDC_ADDRESS,
    tokenAmount: usdcAmount.mul(5).toString(), // Approve 5x the amount to spend so we don't wait for approval tx's every time we run
  };
  const approvalContext = {
    delegatorPkpEthAddress: ethAddress,
  };

  // Running precheck to prevent sending approval tx if not needed or will fail
  const approvalPrecheckResult = await erc20ApprovalToolClient.precheck(
    approvalParams,
    approvalContext
  );
  if (!approvalPrecheckResult.success) {
    throw new Error(`ERC20 approval tool precheck failed: ${approvalPrecheckResult}`);
  } else if (approvalPrecheckResult.result.alreadyApproved) {
    // No need to send tx, allowance is already at that amount
    return undefined;
  }

  // Sending approval tx
  const approvalExecutionResult = await erc20ApprovalToolClient.execute(
    approvalParams,
    approvalContext
  );
  consola.trace('ERC20 Approval Vincent Tool Response:', approvalExecutionResult);
  if (!approvalExecutionResult.success) {
    throw new Error(`ERC20 approval tool execution failed: ${approvalExecutionResult}`);
  }

  return approvalExecutionResult.result.approvalTxHash as `0x${string}`;
}

async function handleSwapExecution({
  delegatorAddress,
  tokenInAddress,
  tokenInAmount,
  tokenInDecimals,
  tokenOutAddress,
}: {
  delegatorAddress: `0x${string}`;
  tokenInAddress: `0x${string}`;
  tokenInAmount: ethers.BigNumber;
  tokenInDecimals: number;
  tokenOutAddress: `0x${string}`;
}): Promise<`0x${string}`> {
  const signedUniswapQuote = await getSignedUniswapQuote({
    tokenInAddress,
    tokenOutAddress,
    recipient: delegatorAddress,
    rpcUrl: BASE_RPC_URL,
    tokenInAmount: ethers.utils.formatUnits(tokenInAmount, tokenInDecimals),
  });

  const uniswapToolClient = getUniswapToolClient();
  const swapParams = {
    signedUniswapQuote,
    rpcUrlForUniswap: BASE_RPC_URL,
  };
  const swapContext = {
    delegatorPkpEthAddress: delegatorAddress,
  };

  const swapPrecheckResult = await uniswapToolClient.precheck(swapParams, swapContext);
  if (!swapPrecheckResult.success) {
    throw new Error(`Uniswap tool precheck failed: ${swapPrecheckResult}`);
  }

  const swapExecutionResult = await uniswapToolClient.execute(swapParams, swapContext);
  consola.trace('Uniswap Swap Vincent Tool Response:', swapExecutionResult);
  if (!swapExecutionResult.success) {
    throw new Error(`Uniswap tool execution failed: ${swapExecutionResult}`);
  }

  return swapExecutionResult.result.swapTxHash as `0x${string}`;
}

export async function executeDCASwap(job: JobType, sentryScope: Sentry.Scope): Promise<void> {
  try {
    const {
      _id,
      data: {
        app,
        pkpInfo: { ethAddress, publicKey },
        purchaseAmount,
      },
    } = job.attrs;

    consola.log('Starting DCA swap job...', {
      _id,
      ethAddress,
      purchaseAmount,
    });

    consola.debug('Fetching user USDC balance...');
    const [usdcBalance, userPermittedAppVersion] = await Promise.all([
      balanceOf(usdcContract, ethAddress),
      getUserPermittedVersion({ ethAddress, appId: VINCENT_APP_ID }),
    ]);

    sentryScope.addBreadcrumb({
      data: {
        usdcBalance,
      },
      message: 'User USDC balance',
    });

    const _purchaseAmount = ethers.utils.parseUnits(purchaseAmount.toFixed(6), 6);
    if (usdcBalance.lt(_purchaseAmount)) {
      throw new Error(
        `Not enough balance for account ${ethAddress} - please fund this account with USDC to DCA`
      );
    }
    if (!userPermittedAppVersion) {
      throw new Error(
        `User ${ethAddress} revoked permission to run this app. Used version to generate: ${app.version}`
      );
    }

    // Run the saved version or update to the currently permitted one if version is compatible
    const appVersionToRun = assertPermittedVersion(app.version, userPermittedAppVersion);
    sentryScope.addBreadcrumb({
      data: {
        app,
        appVersionToRun,
        userPermittedAppVersion,
      },
    });
    if (appVersionToRun !== app.version) {
      // User updated the permitted app version after creating the job, so we need to update it
      // eslint-disable-next-line no-param-reassign
      job.attrs.data.app = { ...job.attrs.data.app, version: appVersionToRun };
      await job.save();
    }

    consola.log('Job details', {
      ethAddress,
      purchaseAmount,
      userPermittedAppVersion,
      usdcBalance: ethers.utils.formatUnits(usdcBalance, 6),
    });

    const approvalHash = await addUsdcApproval({
      ethAddress: ethAddress as `0x${string}`,
      usdcAmount: _purchaseAmount,
    });
    sentryScope.addBreadcrumb({
      data: {
        approvalHash,
      },
    });

    if (approvalHash) {
      await handleOperationExecution({
        isSponsored: alchemyGasSponsor,
        operationHash: approvalHash,
        pkpPublicKey: publicKey,
        provider: baseProvider,
      });
    }

    const swapHash = await handleSwapExecution({
      delegatorAddress: ethAddress as `0x${string}`,
      tokenInAddress: BASE_USDC_ADDRESS,
      tokenInAmount: _purchaseAmount,
      tokenInDecimals: 6,
      tokenOutAddress: BASE_WETH_ADDRESS,
    });
    sentryScope.addBreadcrumb({
      data: {
        swapHash,
      },
    });

    // Create a purchase record with all required fields
    const purchase = new PurchasedCoin({
      ethAddress,
      coinAddress: BASE_WETH_ADDRESS,
      name: 'WETH',
      purchaseAmount: purchaseAmount.toFixed(2),
      scheduleId: _id,
      symbol: 'WETH',
      txHash: swapHash,
    });
    await purchase.save();

    consola.debug(`Successfully purchased ${purchaseAmount} USDC of WETH at tx hash ${swapHash}`);
  } catch (e) {
    // Catch-and-rethrow is usually an antipattern, but Agenda doesn't log failed job reasons to console
    // so this is our chance to log the job failure details using Consola before we throw the error
    // to Agenda, which will write the failure reason to the Agenda job document in Mongo
    const err = normalizeError(e);
    sentryScope.captureException(err);
    consola.error(err.message, err.stack);
    throw e;
  }
}
