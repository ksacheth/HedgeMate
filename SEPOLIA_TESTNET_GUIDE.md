# Testing Vincent DCA on Sepolia Testnet

This guide explains how to configure and test the Vincent DCA application on the Sepolia testnet, allowing you to test the application without using real funds.

## Overview

By default, the Vincent DCA app is configured to work on **Base mainnet** (Chain ID: 8453). To test on Sepolia testnet, you'll need to:

1. Update chain configurations in both backend and frontend
2. Configure Sepolia RPC endpoints
3. Update contract addresses for Sepolia
4. Set up your Vincent App for Sepolia
5. Obtain testnet tokens (ETH, USDC, WBTC)

## Prerequisites

- Node.js v22.16.0
- PNPM 10.7.0
- A Vincent App configured for Sepolia testnet
- Sepolia testnet ETH for gas fees
- Test tokens (USDC, WBTC) on Sepolia

## Step 1: Update Backend Configuration

### 1.1 Update Environment Variables

Edit `packages/dca-backend/.env` (or create from `.env.example`):

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vincent-dca-sepolia

# Sepolia RPC URL (use Alchemy, Infura, or public RPC)
BASE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
# Or use public RPC: https://rpc.sepolia.org

# Optional: Alchemy API for gas sponsorship on Sepolia
ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_POLICY_ID=your_alchemy_policy_id

# Vincent Configuration
VINCENT_APP_ID=your_sepolia_app_id
VINCENT_DELEGATEE_PRIVATE_KEY=your_delegatee_private_key

# Other configuration
PORT=3001
IS_DEVELOPMENT=true
ALLOWED_AUDIENCE=http://localhost:5173
CORS_ALLOWED_DOMAIN=http://localhost:5173
DEFAULT_TX_CONFIRMATIONS=2  # Lower for faster testnet confirmation
```

### 1.2 Update Chain ID and Contract Addresses

Edit `packages/dca-backend/src/lib/agenda/jobs/executeDCASwap/executeDCASwap.ts`:

**Change from Base mainnet:**
```typescript
const BASE_CHAIN_ID = 8453;
const BASE_USDC_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const BASE_WBTC_ADDRESS = '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c';
const BASE_UNISWAP_V3_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481';
```

**To Sepolia testnet:**
```typescript
const BASE_CHAIN_ID = 11155111;  // Sepolia Chain ID
const BASE_USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';  // Sepolia USDC
const BASE_WBTC_ADDRESS = '0x29f2D40B0605204364af54EC677bD022dA425d03';  // Sepolia WBTC (example)
const BASE_UNISWAP_V3_ROUTER = '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD';  // Sepolia Uniswap V3 Router
```

**Important Notes:**
- The contract addresses above are examples. You must verify and use the correct addresses for:
  - Sepolia USDC test token
  - Sepolia WBTC test token (or deploy your own ERC20 test tokens)
  - Sepolia Uniswap V3 Router address

### 1.3 Update Chain References

Find and update all occurrences of `chainId: BASE_CHAIN_ID` to ensure they use Sepolia (11155111).

In the same file, update the `chainId` parameter in:
- `addUsdcApproval()` function (line ~59)
- `handleSwapExecution()` function

## Step 2: Update Frontend Configuration

### 2.1 Update Chain Hook

Edit `packages/dca-frontend/src/hooks/useChain.ts`:

**Change from:**
```typescript
import { LIT_EVM_CHAINS } from '@lit-protocol/constants';

const WBTC_CONTRACT_ADDRESSES: Record<number, string> = {
  [LIT_EVM_CHAINS.base.chainId]: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
};

const USDC_CONTRACT_ADDRESSES: Record<number, string> = {
  [LIT_EVM_CHAINS.base.chainId]: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
};

export const useChain = () => {
  const [chain, setChain] = useState<LITEVMChain>(LIT_EVM_CHAINS.base);
  // ...
};
```

**To:**
```typescript
import { LIT_EVM_CHAINS } from '@lit-protocol/constants';

const WBTC_CONTRACT_ADDRESSES: Record<number, string> = {
  [LIT_EVM_CHAINS.sepolia.chainId]: '0x29f2D40B0605204364af54EC677bD022dA425d03',  // Sepolia WBTC
};

const USDC_CONTRACT_ADDRESSES: Record<number, string> = {
  [LIT_EVM_CHAINS.sepolia.chainId]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',  // Sepolia USDC
};

export const useChain = () => {
  const [chain, setChain] = useState<LITEVMChain>(LIT_EVM_CHAINS.sepolia);
  // ...
};
```

### 2.2 Update Frontend Environment

Edit `packages/dca-frontend/.env`:

```env
VITE_BACKEND_API_URL=http://localhost:3001
VITE_APP_ID=your_sepolia_app_id
VITE_REDIRECT_URI=http://localhost:5173
```

## Step 3: Obtain Sepolia Testnet Tokens

### 3.1 Get Sepolia ETH (for gas fees)

Use one of these Sepolia faucets:
- **Alchemy Sepolia Faucet**: https://sepoliafaucet.com/
- **Infura Sepolia Faucet**: https://www.infura.io/faucet/sepolia
- **Chainlink Faucet**: https://faucets.chain.link/sepolia
- **QuickNode Faucet**: https://faucet.quicknode.com/ethereum/sepolia

You'll need:
1. A wallet address (your agent wallet address)
2. Some faucets may require social media verification or a mainnet balance

### 3.2 Get Sepolia Test USDC and WBTC

For testing ERC20 tokens on Sepolia, you have a few options:

**Option 1: Use Existing Test Tokens**
- Find existing test token contracts on Sepolia
- Use Etherscan Sepolia: https://sepolia.etherscan.io/
- Search for test USDC/WBTC contracts

**Option 2: Deploy Your Own Test Tokens**
```solidity
// Simple ERC20 test token contract
// Deploy using Remix IDE: https://remix.ethereum.org/
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestUSDC is ERC20 {
    constructor() ERC20("Test USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC with 6 decimals
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract TestWBTC is ERC20 {
    constructor() ERC20("Test WBTC", "WBTC") {
        _mint(msg.sender, 100 * 10**8); // 100 WBTC with 8 decimals
    }
    
    function decimals() public pure override returns (uint8) {
        return 8;
    }
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
```

**Option 3: Use Aave Sepolia Faucet**
- Visit: https://staging.aave.com/faucet/
- Connect your wallet
- Mint test tokens (includes USDC, WBTC, and others)

## Step 4: Set Up Uniswap V3 on Sepolia

### 4.1 Find Uniswap V3 Router Address

Uniswap V3 official deployments on Sepolia:
- **SwapRouter02**: `0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD`
- **UniversalRouter**: `0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD`

Verify at: https://docs.uniswap.org/contracts/v3/reference/deployments

### 4.2 Create Liquidity Pools (If Needed)

If you deployed your own test tokens, you may need to create liquidity pools:

1. Go to Uniswap V3 Interface: https://app.uniswap.org/
2. Switch network to Sepolia
3. Navigate to "Pool" → "Create Pool"
4. Add liquidity for your token pairs (USDC/WBTC)
5. Set appropriate fee tiers (0.3% or 0.05%)

## Step 5: Configure Vincent App for Sepolia

### 5.1 Create or Update Vincent App

1. Go to [Vincent Dashboard](https://dashboard.heyvincent.ai/)
2. Create a new app or update existing app
3. **Important**: Configure for Sepolia testnet
   - Set the network/chain to Sepolia (11155111)
   - Add ERC20 Approval ability for Sepolia
   - Add Uniswap Swap ability for Sepolia

### 5.2 Update Ability Configurations

When adding abilities to your Vincent App:

**ERC20 Approval Ability:**
- Network: Sepolia (11155111)
- Token Address: Your Sepolia USDC address
- Spender Address: Uniswap V3 Router on Sepolia

**Uniswap Swap Ability:**
- Network: Sepolia (11155111)
- Router Address: Sepolia Uniswap V3 Router
- Supported tokens: Your Sepolia test tokens

### 5.3 Update App URLs

In Vincent Dashboard, update:
- **App User URL**: `http://localhost:5173` (for local testing)
- **Redirect URIs**: `http://localhost:5173`

### 5.4 Get App ID

Copy your Vincent App ID from the dashboard and update it in:
- `packages/dca-backend/.env` → `VINCENT_APP_ID`
- `packages/dca-frontend/.env` → `VITE_APP_ID`

## Step 6: Configure Delegatee Wallet

### 6.1 Create a Test Wallet

Generate a new Ethereum wallet for testing:

```bash
# Using Node.js and ethers
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
```

Or use MetaMask to create a new account and export the private key.

### 6.2 Fund the Delegatee Wallet

The delegatee wallet needs Sepolia ETH to pay for gas:
- Use the Sepolia faucets mentioned above
- Send at least 0.1 Sepolia ETH to cover multiple transactions

### 6.3 Update Environment Variables

Add the private key to `packages/dca-backend/.env`:

```env
VINCENT_DELEGATEE_PRIVATE_KEY=0x_your_private_key_here
```

**Security Note**: Never commit private keys to version control. Always use `.env` files and ensure they're in `.gitignore`.

## Step 7: Build and Run the Application

### 7.1 Install Dependencies

```bash
cd /path/to/vincent-starter-app2
pnpm install
```

### 7.2 Build the Packages

```bash
pnpm build
```

### 7.3 Start MongoDB

```bash
cd packages/dca-backend
pnpm mongo:build
pnpm mongo:up
```

### 7.4 Start the Application

**Option 1: Start all services**
```bash
# From root directory
pnpm dev
```

**Option 2: Start separately**
```bash
# Terminal 1 - Backend
cd packages/dca-backend
pnpm dev

# Terminal 2 - Frontend
cd packages/dca-frontend
pnpm dev
```

### 7.5 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Step 8: Test the DCA Flow

### 8.1 Connect Wallet

1. Open http://localhost:5173
2. Connect your wallet (must be on Sepolia network)
3. Sign in with Vincent

### 8.2 Delegate Permissions

1. Grant ERC20 Approval ability to the Vincent App
2. Grant Uniswap Swap ability to the Vincent App
3. Confirm the delegations

### 8.3 Create a DCA Task

1. Specify the swap parameters:
   - **From Token**: USDC (Sepolia)
   - **To Token**: WBTC (Sepolia)
   - **Amount**: 10 USDC (small amount for testing)
   - **Frequency**: Every 5 minutes (for quick testing)
2. Create the task
3. The backend will schedule the job

### 8.4 Monitor Execution

1. Check the backend logs to see job execution
2. View transactions on Sepolia Etherscan:
   - Approval transactions
   - Swap transactions
3. Check your wallet balances on Sepolia

### 8.5 Verify Results

- Check that USDC was deducted
- Check that WBTC was received
- Verify transaction hashes on Sepolia Etherscan: https://sepolia.etherscan.io/

## Step 9: Troubleshooting

### Issue: "Insufficient funds for gas"

**Solution:**
- Ensure your agent wallet has Sepolia ETH
- Check balance: https://sepolia.etherscan.io/address/YOUR_WALLET_ADDRESS
- Get more from faucets listed above

### Issue: "ERC20 token transfer failed"

**Solution:**
- Verify you have test USDC in your wallet
- Check token contract address is correct
- Ensure approval was granted

### Issue: "Swap failed - insufficient liquidity"

**Solution:**
- Check if liquidity pools exist for your token pair
- You may need to create a pool or use different tokens
- Try using Aave test tokens which usually have existing pools

### Issue: "Chain ID mismatch"

**Solution:**
- Verify all chain IDs are set to 11155111 (Sepolia)
- Check backend configuration
- Check frontend configuration
- Ensure MetaMask is connected to Sepolia network

### Issue: "Vincent App not found or unauthorized"

**Solution:**
- Verify `VINCENT_APP_ID` is correct in both frontend and backend
- Ensure the app is published in Vincent Dashboard
- Check that abilities are configured for Sepolia network
- Verify redirect URIs match your local development URL

### Issue: "Transaction reverted"

**Solution:**
- Check Sepolia Etherscan for detailed error message
- Verify contract addresses are correct
- Ensure token approvals are in place
- Check that Uniswap router address is correct

### Issue: "MongoDB connection failed"

**Solution:**
```bash
# Check if MongoDB is running
docker ps | grep mongo

# If not running, start it
cd packages/dca-backend
pnpm mongo:up

# Check logs
pnpm mongo:logs
```

### Issue: "RPC errors or slow responses"

**Solution:**
- Use a dedicated RPC provider (Alchemy, Infura) instead of public RPCs
- Public Sepolia RPCs can be unreliable
- Consider getting a free Alchemy or Infura API key

## Step 10: Best Practices for Testnet Testing

### 10.1 Use Small Amounts

- Start with very small token amounts
- Test the full flow before scaling up
- Remember testnet tokens have no value

### 10.2 Monitor Gas Usage

- Track gas costs for approvals and swaps
- Optimize if necessary before mainnet deployment
- Consider gas sponsorship via Alchemy for better UX

### 10.3 Test Edge Cases

- Test with zero balance scenarios
- Test approval revocation
- Test with different time intervals
- Test task deletion while job is running

### 10.4 Keep Logs

- Monitor backend logs for errors
- Check transaction receipts
- Document any issues encountered

### 10.5 Document Your Setup

Keep a record of:
- Contract addresses used
- RPC endpoints
- Wallet addresses
- Vincent App ID
- Any custom configurations

## Switching Back to Base Mainnet

When you're ready to deploy to production:

1. **Revert code changes:**
   - Change chain ID back to 8453
   - Update contract addresses to Base mainnet
   - Update RPC URL to Base mainnet

2. **Update environment variables:**
   - Use mainnet Vincent App ID
   - Use mainnet RPC URL
   - Update MongoDB URI for production

3. **Use production wallet:**
   - Use a properly secured delegatee wallet
   - Ensure adequate ETH for gas fees
   - Consider using a hardware wallet or key management service

4. **Test thoroughly:**
   - Start with small amounts on mainnet
   - Monitor closely for the first few transactions
   - Have monitoring and alerting in place

## Additional Resources

### Sepolia Resources
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Chainlist Sepolia**: https://chainlist.org/?search=sepolia
- **Sepolia Faucet List**: https://faucetlink.to/sepolia

### Uniswap Resources
- **Uniswap Docs**: https://docs.uniswap.org/
- **Uniswap V3 Deployments**: https://docs.uniswap.org/contracts/v3/reference/deployments
- **Uniswap Interface**: https://app.uniswap.org/

### Vincent Resources
- **Vincent Dashboard**: https://dashboard.heyvincent.ai/
- **Vincent Documentation**: https://docs.heyvincent.ai/
- **Vincent SDK**: https://www.npmjs.com/search?q=%40lit-protocol%2Fvincent

### Ethereum Development
- **Remix IDE**: https://remix.ethereum.org/
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/
- **Ethers.js Documentation**: https://docs.ethers.org/v5/

## Summary

Testing on Sepolia testnet requires:
1. ✅ Updating chain ID to 11155111 in backend and frontend
2. ✅ Configuring Sepolia RPC endpoints
3. ✅ Using correct Sepolia contract addresses for USDC, WBTC, and Uniswap
4. ✅ Setting up Vincent App for Sepolia testnet
5. ✅ Obtaining Sepolia ETH and test tokens
6. ✅ Testing the full DCA flow with small amounts

Once testing is complete and successful, you can confidently deploy to mainnet with the appropriate configurations.

---

**Need Help?**
- Open an issue on GitHub
- Check the main [README.md](./README.md) and [ARCHITECTURE.md](./ARCHITECTURE.md)
- Consult Vincent platform documentation
