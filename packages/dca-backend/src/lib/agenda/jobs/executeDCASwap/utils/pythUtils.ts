import { HermesClient } from '@pythnetwork/hermes-client';
import PythAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json' assert { type: 'json' };
import { ethers } from 'ethers';

import { getSigner } from './aaveUtils';
import {
  PYTH_CONTRACT_ADDRESS_SEPOLIA,
  PYTH_PRICE_FEED_ID_ETH_USD,
  OUR_SMART_CONTRACT_ABI,
  OUR_SMART_CONTRACT_ADDRESS,
} from './constants';

export async function executeOnChainPriceUpdate(): Promise<number> {
  try {
    const signer = getSigner(11155111);
    const connection = new HermesClient('https://hermes.pyth.network', {});
    const priceUpdates = await connection.getLatestPriceUpdates([PYTH_PRICE_FEED_ID_ETH_USD]);

    const pythContract = new ethers.Contract(
      PYTH_CONTRACT_ADDRESS_SEPOLIA,
      PythAbi,
      signer.provider
    );
    const updateFee = await pythContract.getUpdateFee(priceUpdates);

    const healthGuardianContract = new ethers.Contract(
      OUR_SMART_CONTRACT_ADDRESS,
      OUR_SMART_CONTRACT_ABI,
      signer
    );
    const tx = await healthGuardianContract.updatePythPriceFeeds(priceUpdates, {
      value: updateFee,
    });
    await tx.wait();

    const priceData = await healthGuardianContract.getETHPrice();
    // getETHPrice returns [price, expo] - we need to apply the exponent
    const price = priceData[0];
    const expo = priceData[1];
    // Convert to decimal by applying the exponent
    const priceNumber = parseFloat(price.toString()) * 10 ** expo;
    return priceNumber;
  } catch (error) {
    throw new Error(`Failed to update and fetch ETH price from Pyth: ${error}`);
  }
}
