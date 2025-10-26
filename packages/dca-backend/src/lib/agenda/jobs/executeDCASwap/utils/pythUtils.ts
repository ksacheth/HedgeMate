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

export async function executeOnChainPriceUpdate(): Promise<Number> {
  const signer = getSigner(11155111);
  const connection = new HermesClient('https://hermes.pyth.network', {});
  const priceUpdates = await connection.getLatestPriceUpdates([PYTH_PRICE_FEED_ID_ETH_USD]);

  // Extract the binary data array from the response
  const priceUpdateData = priceUpdates.binary.data.map((data: string) => `0x${data}`);

  const pythContract = new ethers.Contract(PYTH_CONTRACT_ADDRESS_SEPOLIA, PythAbi, signer.provider);
  const updateFee = await pythContract.getUpdateFee(priceUpdateData);

  const healthGuardianContract = new ethers.Contract(
    OUR_SMART_CONTRACT_ADDRESS,
    OUR_SMART_CONTRACT_ABI,
    signer
  );
  const tx = await healthGuardianContract.updatePrices(priceUpdateData, {
    value: updateFee,
  });
  await tx.wait();
  const [price, expo] = await healthGuardianContract.getETHPrice();
  const priceNumber = ethers.utils.formatUnits(price, Math.abs(expo));
  return parseFloat(priceNumber);
}
