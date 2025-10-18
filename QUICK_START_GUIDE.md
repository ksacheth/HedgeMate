# Quick Start Guide - Vincent DCA Starter App

This guide helps you get the Vincent DCA application running quickly.

## What is This?

Vincent DCA is a demo application that:

- Lets users create automated cryptocurrency swap schedules (Dollar-Cost Averaging)
- Uses Vincent platform to execute swaps on behalf of users
- Features a React frontend and Node.js backend with MongoDB

## 5-Minute Setup

### Prerequisites Check

```bash
# Check Node version (need v22.16.0)
node --version

# Enable PNPM via Corepack
corepack enable

# Verify PNPM works
pnpm --version
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ksacheth/vincent-starter-app2
cd vincent-starter-app2

# 2. Install all dependencies
pnpm install

# 3. Build all packages
pnpm build
```

### Environment Setup

Create `.env` files in the appropriate locations:

**Backend**: `packages/dca-backend/.env`

```env
# Copy from .env.example and fill in:
MONGODB_URI=mongodb://localhost:27017/vincent-dca
VINCENT_APP_ID=your-app-id-here
DELEGATEE_PRIVATE_KEY=your-private-key-here
PORT=3001
NODE_ENV=development
```

**Frontend**: `packages/dca-frontend/.env`

```env
# Copy from .env.example and fill in:
VITE_API_URL=http://localhost:3001
VITE_VINCENT_APP_ID=your-app-id-here
```

### Start MongoDB

```bash
cd packages/dca-backend
pnpm mongo:build
pnpm mongo:up
```

### Run the Application

**Option 1: All services at once (from root)**

```bash
pnpm dev
```

**Option 2: Separate terminals**

```bash
# Terminal 1: Backend
cd packages/dca-backend
pnpm dev

# Terminal 2: Frontend
cd packages/dca-frontend
pnpm dev
```

### Access the App

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:3001
- **MongoDB**: mongodb://localhost:27017

## Architecture Overview

```
┌─────────────┐       ┌─────────────┐       ┌──────────┐
│  Frontend   │──────▶│  Backend    │──────▶│ MongoDB  │
│  (React)    │       │  (Express)  │       │          │
│  Port 5173  │       │  Port 3001  │       │ Port 27017│
└─────────────┘       └──────┬──────┘       └──────────┘
                             │
                             │ Uses Vincent Platform
                             ▼
                      ┌─────────────┐
                      │  Vincent    │
                      │  Platform   │
                      └─────────────┘
```

## Project Structure

```
vincent-starter-app2/
├── packages/
│   ├── dca-backend/      # Node.js API + Job Scheduler
│   │   ├── src/
│   │   │   ├── bin/      # Entry points
│   │   │   └── lib/      # Core logic
│   │   └── package.json
│   │
│   └── dca-frontend/     # React UI
│       ├── src/
│       │   ├── pages/    # Page components
│       │   └── components/ # UI components
│       └── package.json
│
├── package.json          # Root monorepo config
├── pnpm-workspace.yaml   # PNPM workspace setup
└── README.md             # Main documentation
```

## Key Commands

### Development

```bash
pnpm dev              # Run all services in dev mode
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm test             # Run tests (if configured)
pnpm clean            # Clean node_modules and build artifacts
```

### Backend Specific

```bash
cd packages/dca-backend
pnpm dev              # Run backend dev server
pnpm start            # Run production server
pnpm startApiServer   # Run only API server
pnpm startWorker      # Run only job worker
pnpm mongo:up         # Start MongoDB
pnpm mongo:stop       # Stop MongoDB
pnpm mongo:logs       # View MongoDB logs
```

### Frontend Specific

```bash
cd packages/dca-frontend
pnpm dev              # Run Vite dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm storybook        # Run Storybook
```

## Common Issues & Solutions

### Issue: "pnpm: command not found"

**Solution**:

```bash
corepack enable
```

### Issue: "Cannot connect to MongoDB"

**Solution**:

```bash
# Make sure MongoDB is running
cd packages/dca-backend
pnpm mongo:up

# Check logs
pnpm mongo:logs
```

### Issue: "Vincent App ID not found"

**Solution**:

1. Go to [Vincent Dashboard](https://dashboard.heyvincent.ai/)
2. Create or use an existing app
3. Copy the App ID to your `.env` files

### Issue: "Node version too old"

**Solution**:

```bash
# Use nvm to install correct version
nvm install 22.16.0
nvm use 22.16.0
```

### Issue: Build fails with TypeScript errors

**Solution**:

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

## Understanding the Workflow

### Creating a DCA Task

1. **User logs in** via Vincent platform
2. **User delegates** ERC20 approval and Uniswap swap abilities
3. **User creates DCA** by specifying:
   - Token pair (e.g., USDC → WETH)
   - Amount per swap (e.g., 100 USDC)
   - Frequency (e.g., daily)
4. **Backend stores** task in MongoDB
5. **Job scheduler** creates recurring job

### Executing a DCA Swap

1. **Scheduler triggers** job at scheduled time
2. **Backend loads** user's delegated credentials
3. **Backend calls** Vincent ERC20 Approval ability
4. **Backend calls** Vincent Uniswap Swap ability
5. **Blockchain executes** swap via user's agent wallet
6. **Backend updates** task status in DB

## Next Steps

### For Learning

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Comprehensive architecture guide
2. Read [STRUCTURE_DIAGRAM.md](./STRUCTURE_DIAGRAM.md) - Visual diagrams
3. Explore [Vincent Documentation](https://docs.heyvincent.ai/)

### For Development

1. Set up your own Vincent App in the dashboard
2. Understand the abilities: ERC20 Approval and Uniswap Swap
3. Test with a small amount on testnet first
4. Explore the code:
   - Backend: `packages/dca-backend/src/lib/`
   - Frontend: `packages/dca-frontend/src/`

### For Deployment

1. Review the [README.md](./README.md) deployment section
2. Use Railway or Heroku for easy deployment
3. Configure production environment variables
4. Use MongoDB Atlas for production database

## Getting Help

- **Repository Issues**: Open an issue on GitHub
- **Vincent Platform**: Contact support via dashboard
- **Documentation**: Check ARCHITECTURE.md for details

## Technology Stack Summary

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Frontend        | React 19 + Vite + Tailwind CSS       |
| Backend         | Node.js 22 + Express.js + TypeScript |
| Database        | MongoDB + Mongoose                   |
| Scheduler       | Agenda.js                            |
| Blockchain      | ethers.js v5                         |
| Vincent         | @lit-protocol/vincent-\* packages    |
| Package Manager | PNPM 10.7.0                          |

## Useful Links

- [Demo Application](https://dca.heyvincent.ai/)
- [Vincent Dashboard](https://dashboard.heyvincent.ai/)
- [Vincent Docs](https://docs.heyvincent.ai/)
- [Uniswap Docs](https://docs.uniswap.org/)
- [PNPM Docs](https://pnpm.io/)

---

**Ready to start?** Run `pnpm install && pnpm build && pnpm dev` 🚀
