# Vincent DCA Starter App - Architecture & Repository Structure

## Overview

This repository is a **monorepo** that powers the Vincent DCA (Dollar-Cost Averaging) demo application. It demonstrates how to build applications that schedule and execute recurring cryptocurrency swaps on behalf of users using the Vincent platform and delegated agent wallets.

## What is Vincent DCA?

Vincent DCA is a demo application that allows users to:
- Create automated, scheduled token swaps (Dollar-Cost Averaging strategy)
- Delegate permissions to a Vincent App to execute swaps on their behalf
- Manage (create, edit, delete) their DCA tasks through a web interface
- Execute swaps using their agent wallets without sharing private keys

## Repository Structure

```
vincent-starter-app2/
├── packages/
│   ├── dca-backend/          # Backend API server and job scheduler
│   └── dca-frontend/         # React frontend application
├── .husky/                   # Git hooks for code quality
├── .github/                  # GitHub workflows and configurations
├── pnpm-workspace.yaml       # PNPM workspace configuration
├── package.json              # Root package with monorepo scripts
├── tsconfig.base.json        # Shared TypeScript configuration
├── .eslintrc.cjs             # Shared ESLint configuration
├── .prettierrc               # Prettier code formatting rules
├── Procfile                  # Heroku/Railway deployment configuration
└── README.md                 # Main documentation
```

## Monorepo Architecture

This project uses **PNPM workspaces** to manage multiple packages in a single repository. This approach provides:
- **Shared dependencies**: Common packages are installed once at the root
- **Independent packages**: Each package can be built, tested, and deployed separately
- **Consistent tooling**: Shared linting, formatting, and build configurations
- **Efficient development**: Run all packages simultaneously or independently

### Key Technologies

- **Package Manager**: PNPM 10.7.0 (via Corepack)
- **Runtime**: Node.js v22.16.0
- **Language**: TypeScript
- **Build Tool**: Unbuild (backend), Vite (frontend)
- **Code Quality**: ESLint, Prettier, Husky, Lint-staged

## Package Details

### 1. dca-backend (`packages/dca-backend/`)

The backend package is a Node.js application that provides two main functions:

#### Components:

**A. REST API Server**
- Built with Express.js
- Provides endpoints for the frontend to:
  - Create new DCA tasks
  - Read/list existing DCA tasks
  - Update DCA task parameters
  - Delete DCA tasks
- Uses MongoDB for data persistence
- Implements CORS for cross-origin requests
- Uses Helmet for security headers

**B. Job Scheduler (Worker)**
- Uses Agenda.js for job scheduling
- Runs DCA jobs at scheduled intervals
- Integrates with Vincent platform via:
  - **Vincent ERC20 Approval ability**: Authorizes Uniswap to spend user tokens
  - **Vincent Uniswap Swap ability**: Executes the actual token swaps
- Monitors and updates job status

#### Directory Structure:
```
dca-backend/
├── src/
│   ├── bin/                  # Executable entry points
│   │   ├── apiServer.ts      # API server entry point
│   │   ├── jobWorker.ts      # Job worker entry point
│   │   └── serverWorker.ts   # Combined server+worker
│   ├── lib/
│   │   ├── apiServer.ts      # Express API implementation
│   │   ├── jobWorker.ts      # Agenda job processor
│   │   ├── agenda/           # Job scheduling logic
│   │   ├── express/          # API routes and middleware
│   │   ├── mongo/            # MongoDB models and connection
│   │   ├── env.ts            # Environment configuration
│   │   ├── logger.ts         # Logging utilities
│   │   └── sentry.ts         # Error tracking
│   └── index.ts              # Main exports
├── Dockerfile.mongo          # Local MongoDB container
├── init-mongo.js             # MongoDB initialization script
├── build.config.ts           # Unbuild configuration
├── jest.config.js            # Jest test configuration
└── package.json              # Backend dependencies and scripts
```

#### Key Dependencies:
- `express`: Web framework
- `@whisthub/agenda`: Job scheduling
- `mongoose`: MongoDB ODM
- `@lit-protocol/vincent-*`: Vincent platform SDKs
- `@lit-protocol/vincent-ability-*`: Blockchain abilities
- `@sentry/node`: Error monitoring

#### Available Scripts:
- `pnpm build`: Build for production
- `pnpm dev`: Run in development mode with auto-reload
- `pnpm start`: Run production server+worker combined
- `pnpm startApiServer`: Run only API server
- `pnpm startWorker`: Run only job worker
- `pnpm test`: Run Jest tests
- `pnpm lint`: Lint TypeScript code
- `pnpm mongo:build`: Build local MongoDB Docker container
- `pnpm mongo:up`: Start MongoDB container

### 2. dca-frontend (`packages/dca-frontend/`)

The frontend package is a React application that provides the user interface.

#### Features:
- User authentication via Vincent platform
- Wallet connection and delegation
- Create DCA tasks with customizable parameters:
  - Token pairs to swap
  - Amount per swap
  - Frequency (daily, weekly, etc.)
- View and manage active DCA tasks
- Edit existing tasks
- Delete tasks
- View task execution history and status

#### Directory Structure:
```
dca-frontend/
├── src/
│   ├── pages/                # Page components
│   │   ├── home.tsx          # Dashboard/main page
│   │   └── login.tsx         # Login/auth page
│   ├── components/           # Reusable UI components
│   │   ├── active-dcas.tsx   # Display active DCA tasks
│   │   ├── create-dca.tsx    # DCA creation form
│   │   ├── dialogue-*.tsx    # Modal dialogs
│   │   ├── wallet.tsx        # Wallet connection UI
│   │   └── ui/               # Base UI components (shadcn/ui)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── config/               # Configuration
│   ├── stories/              # Storybook stories
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── config.ts             # App configuration
├── .storybook/               # Storybook configuration
├── public/                   # Static assets
├── vite.config.ts            # Vite build configuration
├── eslint.config.js          # ESLint configuration
├── components.json           # shadcn/ui configuration
└── package.json              # Frontend dependencies and scripts
```

#### Key Dependencies:
- `react` & `react-dom`: UI framework
- `@lit-protocol/vincent-app-sdk`: Vincent platform integration
- `@lit-protocol/auth-helpers`: Authentication
- `@radix-ui/*`: UI component primitives
- `@tanstack/react-table`: Data tables
- `tailwindcss`: Styling
- `vite`: Build tool and dev server
- `@sentry/react`: Error monitoring

#### UI Component System:
- Built with **shadcn/ui** components
- Styled with **Tailwind CSS**
- Uses **Radix UI** primitives for accessibility

#### Available Scripts:
- `pnpm build`: Build for production
- `pnpm dev`: Run Vite dev server
- `pnpm preview`: Preview production build
- `pnpm lint`: Lint code
- `pnpm storybook`: Run Storybook for component development

## Development Workflow

### Prerequisites
1. **Node.js** v22.16.0 or higher
2. **PNPM** 10.7.0 (enabled via Corepack)
3. **MongoDB** (Docker or local instance)
4. **Vincent App** credentials (for production use)

### Initial Setup

```bash
# Enable PNPM via Corepack
corepack enable

# Install dependencies for all packages
pnpm install

# Build all packages
pnpm build
```

### Local Development

#### 1. Set Up Environment Variables

Each package requires environment configuration:

**Root `.env`** (optional):
```env
# Shared environment variables
```

**Backend `.env`** (`packages/dca-backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/vincent-dca
VINCENT_APP_ID=your-app-id
DELEGATEE_PRIVATE_KEY=your-private-key
PORT=3001
# See .env.example for complete list
```

**Frontend `.env`** (`packages/dca-frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
VITE_VINCENT_APP_ID=your-app-id
# See .env.example for complete list
```

#### 2. Start MongoDB

```bash
# Build and start MongoDB container
cd packages/dca-backend
pnpm mongo:build
pnpm mongo:up
```

#### 3. Run Development Servers

**Option A: Run all services together** (from root):
```bash
pnpm dev
```

**Option B: Run services separately**:
```bash
# Terminal 1: Backend
cd packages/dca-backend
pnpm dev

# Terminal 2: Frontend
cd packages/dca-frontend
pnpm dev
```

### Building for Production

```bash
# Build all packages
pnpm build

# Start production servers
pnpm start
```

## Code Quality & Git Workflow

### Pre-commit Hooks (Husky)

The repository uses Husky to enforce code quality before commits:

1. **Pre-commit**: Runs lint-staged on changed files
2. **Commit-msg**: Validates commit message format

### Lint-staged Configuration

Configured in `.lintstagedrc.json`:
- Runs ESLint on TypeScript/JavaScript files
- Runs Prettier on all supported files
- Only processes staged files for faster checks

### Linting & Formatting

```bash
# Lint all packages
pnpm lint

# Format code (via Prettier)
# Automatically done via lint-staged on commit
```

## Deployment

### Heroku/Railway Deployment

The `Procfile` defines the process to start:
```
web: cd packages/dca-backend && pnpm start
```

This starts the combined server+worker process.

### Deployment Checklist

1. **Set Environment Variables**: Use platform secret manager (not `.env` files)
2. **Database**: Provision MongoDB (e.g., MongoDB Atlas)
3. **Build**: `pnpm install && pnpm build`
4. **Start**: Use Procfile command or separate API/Worker processes
5. **Vincent App Configuration**:
   - Update "App User URL" to deployed backend URL
   - Update "Redirect URIs" for OAuth flow

### Separate API and Worker Instances

For production, you may want to run API and Worker on separate servers:

**API Server**:
```bash
node ./dist/bin/apiServer.mjs
```

**Job Worker**:
```bash
node ./dist/bin/jobWorker.mjs
```

## Vincent Platform Integration

### What is Vincent?

Vincent is a platform for building AI agents that can interact with blockchains on behalf of users through **delegated agent wallets**. Users delegate specific permissions (abilities) to apps without sharing their private keys.

### How This App Uses Vincent

1. **User Authentication**: Users log in via Vincent platform
2. **Delegation**: Users delegate permissions to the DCA app:
   - ERC20 Approval ability (to approve Uniswap)
   - Uniswap Swap ability (to execute swaps)
3. **Execution**: Backend uses delegated wallet to:
   - Approve tokens for Uniswap
   - Execute swaps on user's behalf
4. **Security**: Users maintain control and can revoke access anytime

### Vincent Abilities Used

- **`@lit-protocol/vincent-ability-erc20-approval`**: Approves ERC20 tokens for spending
- **`@lit-protocol/vincent-ability-uniswap-swap`**: Executes token swaps on Uniswap

### Vincent SDKs

- **`@lit-protocol/vincent-app-sdk`**: Core SDK for Vincent app integration
- **`@lit-protocol/vincent-scaffold-sdk`**: Scaffolding utilities
- **`@lit-protocol/lit-node-client`**: Lit Protocol node client
- **`@lit-protocol/auth-helpers`**: Authentication utilities

## TypeScript Configuration

The project uses a shared TypeScript configuration:

### Base Config (`tsconfig.base.json`)
```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "Bundler",
    "strict": true,
    "outDir": "./dist"
  }
}
```

Each package extends this base configuration with package-specific settings.

## Testing

### Backend Tests
- Framework: Jest with ts-jest
- Location: `packages/dca-backend/src/**/*.test.ts`
- Run: `cd packages/dca-backend && pnpm test`

### Frontend Tests
- Framework: Vitest with Playwright
- Run: `cd packages/dca-frontend && pnpm test` (when configured)

### Storybook (Component Development)
```bash
cd packages/dca-frontend
pnpm storybook
```

## Monitoring & Observability

### Sentry Integration

Both packages integrate with Sentry for error tracking:
- **Backend**: `@sentry/node`
- **Frontend**: `@sentry/react`

Configure via environment variables:
```env
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

## Important Considerations

### Version Management
- **Ability Versions**: Users must have the exact ability versions your app uses
- **Vincent App Updates**: If you update abilities, users must reconnect
- **Multiple Versions**: Support multiple ability versions if needed

### Security
- **Private Keys**: Never commit private keys or secrets
- **Environment Variables**: Use platform secret managers in production
- **Gas Fees**: Users' agent wallets need funds for gas (unless sponsored)
- **Revocations**: Handle cases where users revoke delegation

### Error Handling
- **Prepare Functions**: Always call ability prepare/precheck functions
- **Graceful Degradation**: Handle API failures gracefully
- **User Feedback**: Provide clear error messages to users

## Common Development Tasks

### Adding a New DCA Feature

1. **Backend**:
   - Add model to `packages/dca-backend/src/lib/mongo/`
   - Add API route to `packages/dca-backend/src/lib/express/`
   - Add job handler to `packages/dca-backend/src/lib/agenda/`

2. **Frontend**:
   - Add UI component to `packages/dca-frontend/src/components/`
   - Update API client hooks in `packages/dca-frontend/src/hooks/`
   - Test with Storybook

### Debugging Jobs

1. Check MongoDB for job status
2. View worker logs (console or Sentry)
3. Test jobs manually via API

### Updating Dependencies

```bash
# Update all workspaces
pnpm update -r

# Update specific package
pnpm --filter dca-backend update mongoose
```

## Resources

- [Vincent Dashboard](https://dashboard.heyvincent.ai/)
- [Demo Application](https://dca.heyvincent.ai/)
- [Vincent Documentation](https://docs.heyvincent.ai/)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Agenda.js Documentation](https://github.com/agenda/agenda)

## Support

For issues with:
- **This starter app**: Open an issue in this repository
- **Vincent platform**: Contact Vincent support
- **Dependencies**: Check respective package documentation

## License

This is a demo application provided "as is" for educational purposes. See README.md for full disclaimers.
