# HedgeMate - AAVE Health Guardian

A monorepo that powers the _HedgeMate Health Guardian_ application.

This project demonstrates an automated safety net for AAVE borrowers that prevents liquidation by automatically repaying debt when collateral prices drop below a trigger threshold.

## The Problem It Solves

When you borrow assets on AAVE, you must provide collateral (like ETH). If the price of your collateral drops significantly, your loan becomes risky and your "Health Factor" decreases. If your Health Factor falls below a certain threshold, your collateral gets automatically sold off (liquidated) to repay your debt, and you incur a penalty fee. This can happen quickly during a market crash, even while you're asleep or away.

## Our Solution

Our application is an automated tool that prevents liquidation from happening. Here's how it works:

1. **Set a Rule:** The user defines a trigger price. For example: "If the price of ETH drops below $2,000..."
2. **Define an Action:** The user also specifies an automatic action. For example: "...then repay $500 of my stablecoin debt for me."
3. **Enable Protection:** The user pre-approves our system to spend that $500 on their behalf.

Our automated bot then constantly monitors the price of ETH using a Pyth Oracle. If the price ever hits the user's trigger ($2,000), the bot instantly executes the repayment on AAVE.

## The Benefit

By automatically repaying a portion of their debt, the user's Health Factor immediately improves, moving them away from the danger of liquidation. Essentially, we are building an insurance service that gives AAVE users peace of mind by automatically de-risking their loans during market volatility.

## Prerequisites

- Node ^22.16.0
- pnpm ^10.7.0
- Docker or a local MongoDB instance
- A Vincent App with AAVE interaction abilities

## Monorepo Structure

This codebase is composed of three main parts:

- Frontend: React app where users can create, edit, and delete health guard rules.
- Database: MongoDB to persist health guard rules.
- Backend (Node.js):
  - Express.js API server used by the frontend
  - Agenda-based job scheduler that monitors prices and executes protection
  - Integration with a Vincent App to execute AAVE repayments on behalf of users
    - Vincent AAVE ability: executes debt repayments when conditions are met
    - Pyth Oracle integration: monitors collateral prices in real-time

## Packages

| Package                                         | Purpose                                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| [dca-frontend](packages/dca-frontend/README.md) | Frontend for end-users to define health guard rules                              |
| [dca-backend](packages/dca-backend/README.md)   | Backend REST API and worker instance using NodeJS; deployed to Heroku currently. |

## Vincent App

To execute operations on behalf of your users (delegators), you need a Vincent App to which they can delegate their agent wallet.

### Create your own Vincent App

To run this code and sign on behalf of your delegators, create your own Vincent App:

1. Go to the [Vincent Dashboard](https://dashboard.heyvincent.ai/) and log in as a builder.
2. Create a new app for AAVE Health Guardian.
3. Add the AAVE interaction abilities.
4. Publish the app.
5. Once users can connect to it, configure the backend with your App ID and the delegatee private key via environment variables.
6. Once deployed, you'll need to update the `App User URL` and `Redirect URIs` to the URL deployed.

## Quick Start

Install dependencies and build the packages:

```zsh
pnpm install && pnpm build
```

Note: remember to enable [Corepack](https://github.com/nodejs/corepack): `corepack enable`

## Local Development

Local development uses `dotenvx` to load environment variables from `.env` files. You should have a `.env` at the repository root and one for each package that needs it.

Each project includes a `.env.example` with placeholders and defaults you can copy and fill in.

### Start a local MongoDB

A Dockerfile is provided to run MongoDB locally:

```zsh
pnpm -r mongo:build
```

### Run all services

After setting environment variables and starting the database, run:

```zsh
pnpm dev
```

## Production

Production does not use `dotenvx`. Inject environment variables via your platform's secret manager or environment configuration—do not write them to the runtime filesystem.

Then start the services with:

```zsh
pnpm start
```

## Notes and Gotchas

- You will most likely not run API and Worker instances on the same server.
- The abilities you execute MUST match the exact versions connected in each user's agent wallet.
  - If you update an ability, users must reconnect; you cannot use a newer version they haven't approved.
  - If you support multiple versions of the same Vincent App, your server may need to run multiple versions of abilities side-by-side.
  - Install specific versions of abilities in your app to avoid version conflicts.
- Users can revoke or update their connection at any time; handle revocations and version changes gracefully.
- Always call prepare and precheck functions for abilities to avoid preventable errors.
- Users' agent wallets send their own transactions. Ensure they have sufficient funds for gas, unless you plan to sponsor it.

## Disclaimers

- This is a demo application and is not intended for production use without considerable modifications.
- The software is provided "as is", without warranty of any kind, express or implied, including but
  not limited to the warranties of merchantability, fitness for a particular purpose and
  noninfringement. We make no guarantees about its stability or suitability for production use. It
  is provided for demo and educational purposes.
- It's your responsibility to comply with all applicable laws and regulations for your jurisdiction
  with respect to the use of this software.
