export const AAVE_POOL_ADDRESS_SEPOLIA = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951';
export const AAVE_POOL_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserAccountData',
    outputs: [
      { internalType: 'uint256', name: 'totalCollateralBase', type: 'uint256' },
      { internalType: 'uint256', name: 'totalDebtBase', type: 'uint256' },
      { internalType: 'uint256', name: 'availableBorrowsBase', type: 'uint256' },
      { internalType: 'uint256', name: 'currentLiquidationThreshold', type: 'uint256' },
      { internalType: 'uint256', name: 'ltv', type: 'uint256' },
      { internalType: 'uint256', name: 'healthFactor', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'interestRateMode', type: 'uint256' },
      { internalType: 'address', name: 'onBehalfOf', type: 'address' },
    ],
    name: 'repay',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const TIME = '5 minutes';

export const PYUSD_ADDRESS_SEPOLIA = '0x0987654321fedcba0987654321fedcba09876543';
export const PYUSD_ABI = [];

export const PYTH_FEED_ID = 'ETH/USD';
export const USDC_ADDRESS_SEPOLIA = '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8';

export const PYTH_CONTRACT_ADDRESS_SEPOLIA = '0xDd24F84d36BF92C65F92307595335bdFab5Bbd21';
export const PYTH_PRICE_FEED_ID_ETH_USD =
  '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';

export const OUR_SMART_CONTRACT_ADDRESS = '0x417AD02994F1933261150Ec599181D444F0c5B11';
export const OUR_SMART_CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'pythContract', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'getETHPrice',
    outputs: [
      { internalType: 'int64', name: 'price', type: 'int64' },
      { internalType: 'int32', name: 'expo', type: 'int32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes[]', name: 'priceUpdate', type: 'bytes[]' }],
    name: 'getUpdateFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes[]', name: 'priceUpdate', type: 'bytes[]' }],
    name: 'updatePythPriceFeeds',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
];
