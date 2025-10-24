import { ethers } from 'ethers';
const AAVE_POOL_ADDRESS = '0x6ae43d3271ff6888e7fc43fd7321a503ff738951';
const AAVE_POOL_ABI = [
  'function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
];
const getHealth = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, provider);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    if (address.length != 0) {
      const accountData = await contract.getUserAccountData(address);
      const rawData = accountData.healthFactor;
      const healthFactor = ethers.utils.formatUnits(rawData, 18);
      return { healthFactor };
    } else {
      throw new Error('Not connected or address is not valid');
    }
  } catch (err) {
    throw new Error(`Not connected or address is not valid ${err}`);
  }
};
export { getHealth };
