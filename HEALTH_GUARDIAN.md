# AAVE Health Guardian

## Overview

The AAVE Health Guardian is an automated protection system that monitors AAVE borrowing positions and automatically repays debt when certain conditions are met, preventing liquidation.

## How It Works

### The Problem

When you borrow assets on AAVE, you must provide collateral (like ETH). If the price of your collateral drops significantly, your loan becomes risky and your "Health Factor" decreases. If your Health Factor falls below 1.0, your collateral gets automatically sold off (liquidated) to repay your debt, and you incur a penalty fee.

### The Solution

The Health Guardian continuously monitors:

1. **ETH Price** - Using Pyth Oracle for real-time price feeds
2. **Health Factor** - Your AAVE position's health status

When both conditions are met:

- ETH price drops below your trigger price
- Health Factor falls below 1.5 (safety threshold)

The system automatically repays a portion of your debt, improving your Health Factor and preventing liquidation.

## API Endpoints

### Create Protection Rule

```http
POST /api/v1/rules
Content-Type: application/json

{
  "user": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "triggerPrice": "2000",
  "repayAmount": "500",
  "chainId": 11155111,
  "collateralAsset": "ETH",
  "debtAsset": "USDC",
  "protocol": "AaveV3"
}
```

**Response:**

```json
{
  "message": "Protection rule created and scheduled successfully.",
  "rule": {
    "_id": "...",
    "user": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "triggerPrice": "2000",
    "repayAmount": "500",
    "isActive": true,
    ...
  }
}
```

### List User's Protection Rules

```http
GET /api/v1/rules?user=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Response:**

```json
{
  "rules": [
    {
      "_id": "...",
      "user": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "triggerPrice": "2000",
      "repayAmount": "500",
      "isActive": true,
      ...
    }
  ]
}
```

### Deactivate Protection Rule

```http
DELETE /api/v1/rules/:ruleId
```

**Response:**

```json
{
  "message": "Rule deactivated successfully"
}
```

## Architecture

### Components

1. **API Server** - REST API for rule management
2. **Job Scheduler** - Agenda-based scheduler that runs checks every 5 minutes
3. **MongoDB** - Stores protection rules and job state
4. **Smart Contracts**:
   - AAVE V3 Pool (Sepolia: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`)
   - Pyth Oracle (Sepolia: `0xDd24F84d36BF92C65F92307595335bdFab5Bbd21`)
   - Health Guardian Contract (Sepolia: `0x417AD02994F1933261150Ec599181D444F0c5B11`)

### Job Execution Flow

```
Every 5 minutes:
├── Fetch latest ETH price from Pyth Oracle
├── Update on-chain price in Health Guardian contract
├── Check user's AAVE Health Factor
├── Evaluate trigger conditions:
│   ├── currentPrice < triggerPrice?
│   └── healthFactor < 1.5?
└── If both true:
    ├── Approve AAVE to spend backend's USDC
    ├── Execute repay on behalf of user
    ├── Deactivate rule
    └── Remove scheduled job
```

## Setup Requirements

### Environment Variables

```bash
# MongoDB connection
MONGO_URI=mongodb://localhost:27017/hedgemate

# Ethereum provider
ALCHEMY_API_KEY=your_alchemy_api_key

# Backend wallet (must have USDC for repayments)
PRIVATE_KEY=your_private_key
```

### Backend Wallet Requirements

The backend wallet must have:

1. **ETH** - For gas fees
2. **USDC** - To perform repayments on behalf of users

**Important**: The current implementation uses the backend's USDC to repay user debts. In production, consider implementing one of these alternatives:

- Users pre-approve backend to spend their USDC
- Backend maintains a USDC pool and gets reimbursed via user approvals
- Use a dedicated smart contract for pull-based repayments

## Trigger Logic

The system uses a dual-condition trigger for safety:

1. **Primary Condition**: `currentPrice < triggerPrice`

   - User-defined price threshold
   - Example: Trigger when ETH drops below $2,000

2. **Safety Condition**: `healthFactor < 1.5`
   - Prevents unnecessary repayments when user is not at risk
   - AAVE liquidates at HF < 1.0, so 1.5 provides a safety buffer

Both conditions must be true to trigger automatic repayment.

## Security Considerations

1. **Backend Wallet Security**

   - Store private key securely (use secret manager in production)
   - Backend wallet has significant USDC exposure
   - Consider using a multi-sig wallet for production

2. **Input Validation**

   - All API inputs are validated
   - Ethereum addresses are verified
   - Numeric values are checked for validity

3. **Error Handling**

   - All critical operations have try-catch blocks
   - Errors are logged and jobs are marked as failed
   - Failed jobs are retried by Agenda

4. **Rate Limiting**
   - Consider adding rate limiting to API endpoints
   - Prevent spam rule creation

## Testing

Before deploying to production:

1. **Test with small amounts** - Start with minimal repayment amounts
2. **Monitor gas costs** - Pyth price updates require payment
3. **Test different scenarios**:
   - Price drops below trigger
   - Health factor deteriorates
   - Insufficient USDC in backend wallet
   - Network congestion/high gas

## Limitations

1. **5-minute delay** - Jobs run every 5 minutes, so there's a lag
2. **Gas costs** - Each check incurs gas costs for price updates
3. **Backend dependency** - System relies on backend being operational
4. **USDC liquidity** - Backend must maintain sufficient USDC balance

## Future Enhancements

1. **Smart Contract Integration**

   - Deploy dedicated smart contract for automated repayments
   - Allow users to deposit USDC directly into contract

2. **Multi-Asset Support**

   - Support different collateral types (not just ETH)
   - Support different debt tokens (not just USDC)

3. **Dynamic Health Factor Threshold**

   - Allow users to set their own HF threshold
   - Provide recommended thresholds based on volatility

4. **Notification System**

   - Email/SMS alerts when rules trigger
   - Warnings when HF approaches danger zone

5. **Gas Optimization**

   - Batch multiple operations
   - Use flash loans for capital efficiency

6. **Frontend Integration**
   - UI for creating and managing rules
   - Real-time monitoring dashboard
   - Historical trigger analytics

## Support

For issues or questions, please refer to the main README.md or create an issue in the repository.
