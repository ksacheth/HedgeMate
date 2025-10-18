# Vincent DCA - System Architecture Diagram

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         End User                                 │
│                    (Web Browser)                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ HTTPS
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    dca-frontend                                  │
│                   (React + Vite)                                 │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Pages:                                                    │ │
│  │  • home.tsx  (Dashboard)                                  │ │
│  │  • login.tsx (Authentication)                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Components:                                               │ │
│  │  • create-dca.tsx    (Create DCA forms)                   │ │
│  │  • active-dcas.tsx   (List active DCAs)                   │ │
│  │  • wallet.tsx        (Wallet connection)                  │ │
│  │  • ui/               (shadcn/ui components)               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Vincent Integration:                                      │ │
│  │  • @lit-protocol/vincent-app-sdk                          │ │
│  │  • @lit-protocol/auth-helpers                             │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ REST API
                  │ (HTTP/JSON)
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    dca-backend                                   │
│                  (Node.js + Express)                             │
│                                                                   │
│  ┌──────────────────────────┐  ┌────────────────────────────┐  │
│  │                          │  │                            │  │
│  │   API Server             │  │   Job Worker               │  │
│  │   (apiServer.ts)         │  │   (jobWorker.ts)           │  │
│  │                          │  │                            │  │
│  │  ┌────────────────────┐ │  │  ┌──────────────────────┐ │  │
│  │  │ Express Routes:    │ │  │  │ Agenda Scheduler:    │ │  │
│  │  │                    │ │  │  │                      │ │  │
│  │  │ • POST /dcas       │ │  │  │ • Process Jobs       │ │  │
│  │  │ • GET  /dcas       │ │  │  │ • Execute Swaps      │ │  │
│  │  │ • PUT  /dcas/:id   │ │  │  │ • Update Status      │ │  │
│  │  │ • DELETE /dcas/:id │ │  │  │ • Retry Failed Jobs  │ │  │
│  │  └────────────────────┘ │  │  └──────────────────────┘ │  │
│  │                          │  │                            │  │
│  │  ┌────────────────────┐ │  │  ┌──────────────────────┐ │  │
│  │  │ Middleware:        │ │  │  │ Vincent Integration: │ │  │
│  │  │ • CORS             │ │  │  │                      │ │  │
│  │  │ • Helmet (security)│ │  │  │ • ERC20 Approval     │ │  │
│  │  │ • Body Parser      │ │  │  │ • Uniswap Swap       │ │  │
│  │  │ • Error Handler    │ │  │  │ • Delegated Signing  │ │  │
│  │  └────────────────────┘ │  │  └──────────────────────┘ │  │
│  └──────────┬───────────────┘  └────────────┬───────────────┘  │
│             │                               │                   │
│             └───────────┬───────────────────┘                   │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          │ MongoDB Protocol
                          │
                          ▼
                 ┌─────────────────┐
                 │                 │
                 │    MongoDB      │
                 │   (Database)    │
                 │                 │
                 │  Collections:   │
                 │  • dcas         │
                 │  • agendaJobs   │
                 │  • users        │
                 │                 │
                 └─────────────────┘
```

## Vincent Platform Integration Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                         Vincent Platform                              │
│                    (https://dashboard.heyvincent.ai)                 │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                   Vincent App (DCA App)                        │ │
│  │                                                                 │ │
│  │  Configured Abilities:                                         │ │
│  │  • ERC20 Approval (v3.1.0)                                     │ │
│  │  • Uniswap Swap (v5.0.0)                                       │ │
│  │                                                                 │ │
│  │  App Settings:                                                 │ │
│  │  • App ID: [Your App ID]                                       │ │
│  │  • Redirect URIs: [Your Frontend URL]                          │ │
│  │  • App User URL: [Your Backend URL]                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────────┬───────────────────────────────┬───────────────────────┘
                │                               │
                │ User Authentication           │ Vincent SDK Calls
                │ & Delegation                  │ (Execute Abilities)
                │                               │
                ▼                               ▼
┌───────────────────────────┐    ┌─────────────────────────────────┐
│                           │    │                                 │
│   Frontend (User Auth)    │    │   Backend (Job Execution)       │
│                           │    │                                 │
│  1. User logs in          │    │  4. Load user's delegated       │
│  2. User connects wallet  │    │     wallet credentials          │
│  3. User delegates        │    │  5. Call ERC20 Approval         │
│     abilities to app      │    │  6. Call Uniswap Swap           │
│                           │    │  7. Transaction executed via    │
└───────────────────────────┘    │     user's agent wallet         │
                                 │                                 │
                                 └─────────────────────────────────┘
                                                 │
                                                 │ Blockchain Txns
                                                 ▼
                                    ┌─────────────────────────┐
                                    │                         │
                                    │  Ethereum Blockchain    │
                                    │                         │
                                    │  • Uniswap Contracts    │
                                    │  • ERC20 Tokens         │
                                    │  • User's Agent Wallet  │
                                    │                         │
                                    └─────────────────────────┘
```

## Data Flow: Creating a DCA Task

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User   │────▶│ Frontend │────▶│  Backend │────▶│ MongoDB  │
│         │     │          │     │ API      │     │          │
└─────────┘     └──────────┘     └──────────┘     └──────────┘
    │
    │ 1. Fill DCA form
    │    (token pair, amount, frequency)
    │
    ▼
┌──────────────────────────────────────┐
│ create-dca.tsx                       │
│ • Input validation                   │
│ • Form submission                    │
└──────────────────────────────────────┘
    │
    │ 2. POST /dcas
    │    { tokenA, tokenB, amount, frequency }
    │
    ▼
┌──────────────────────────────────────┐
│ apiServer.ts                         │
│ • Validate request                   │
│ • Check user authentication          │
│ • Store DCA task in DB               │
└──────────────────────────────────────┘
    │
    │ 3. Create DCA record
    │
    ▼
┌──────────────────────────────────────┐
│ MongoDB                              │
│ • Insert DCA document                │
│ • Create Agenda job                  │
└──────────────────────────────────────┘
    │
    │ 4. Response: DCA created
    │
    ▼
┌──────────────────────────────────────┐
│ Frontend                             │
│ • Update UI                          │
│ • Show success message               │
│ • Refresh DCA list                   │
└──────────────────────────────────────┘
```

## Data Flow: Executing a DCA Job

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Agenda   │────▶│ Vincent  │────▶│Uniswap   │────▶│Blockchain│
│Scheduler │     │Platform  │     │Contract  │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
    │
    │ 1. Job scheduled time reached
    │
    ▼
┌──────────────────────────────────────┐
│ jobWorker.ts                         │
│ • Fetch DCA task from DB             │
│ • Load user delegation               │
└──────────────────────────────────────┘
    │
    │ 2. Check if approval needed
    │
    ▼
┌──────────────────────────────────────┐
│ Vincent ERC20 Approval Ability       │
│ • prepare() - validate parameters    │
│ • precheck() - check current state   │
│ • approve() - sign & submit txn      │
└──────────────────────────────────────┘
    │
    │ 3. Approval txn submitted
    │
    ▼
┌──────────────────────────────────────┐
│ Blockchain (Ethereum)                │
│ • ERC20.approve() executed           │
│ • Wait for confirmation              │
└──────────────────────────────────────┘
    │
    │ 4. Execute swap
    │
    ▼
┌──────────────────────────────────────┐
│ Vincent Uniswap Swap Ability         │
│ • prepare() - calculate amounts      │
│ • precheck() - validate balances     │
│ • swap() - sign & submit txn         │
└──────────────────────────────────────┘
    │
    │ 5. Swap txn submitted
    │
    ▼
┌──────────────────────────────────────┐
│ Blockchain (Ethereum)                │
│ • Uniswap.swap() executed            │
│ • Tokens swapped                     │
│ • Wait for confirmation              │
└──────────────────────────────────────┘
    │
    │ 6. Update job status
    │
    ▼
┌──────────────────────────────────────┐
│ MongoDB                              │
│ • Update DCA status                  │
│ • Record transaction hash            │
│ • Schedule next job                  │
└──────────────────────────────────────┘
    │
    │ 7. User can view status in frontend
    │
    ▼
┌──────────────────────────────────────┐
│ Frontend (active-dcas.tsx)           │
│ • Poll for updates                   │
│ • Display transaction status         │
│ • Show next scheduled time           │
└──────────────────────────────────────┘
```

## Directory Structure (Detailed)

```
vincent-starter-app2/
│
├── .github/                          # GitHub Actions & workflows
│   └── agents/                       # Custom agent configurations
│
├── .husky/                           # Git hooks
│   ├── commit-msg                    # Commit message validation
│   └── pre-commit                    # Pre-commit linting
│
├── packages/                         # Monorepo packages
│   │
│   ├── dca-backend/                  # Backend package
│   │   ├── src/
│   │   │   ├── bin/                  # Executable entry points
│   │   │   │   ├── apiServer.ts      # Start API server only
│   │   │   │   ├── jobWorker.ts      # Start job worker only
│   │   │   │   ├── serverWorker.ts   # Start both (dev/prod)
│   │   │   │   └── mintRLINft.ts     # Utility script
│   │   │   │
│   │   │   ├── lib/                  # Core library code
│   │   │   │   ├── agenda/           # Job scheduling
│   │   │   │   │   ├── jobs/         # Individual job handlers
│   │   │   │   │   └── index.ts      # Agenda setup
│   │   │   │   │
│   │   │   │   ├── express/          # API server
│   │   │   │   │   ├── routes/       # API route handlers
│   │   │   │   │   ├── middleware/   # Express middleware
│   │   │   │   │   └── index.ts      # Express app setup
│   │   │   │   │
│   │   │   │   ├── mongo/            # Database
│   │   │   │   │   ├── models/       # Mongoose models
│   │   │   │   │   ├── schemas/      # Mongoose schemas
│   │   │   │   │   └── connection.ts # DB connection
│   │   │   │   │
│   │   │   │   ├── apiServer.ts      # API server setup
│   │   │   │   ├── jobWorker.ts      # Job worker setup
│   │   │   │   ├── env.ts            # Environment config
│   │   │   │   ├── logger.ts         # Logging utilities
│   │   │   │   ├── error.ts          # Error handling
│   │   │   │   └── sentry.ts         # Sentry integration
│   │   │   │
│   │   │   ├── index.ts              # Main exports
│   │   │   └── mintRLINft.ts         # NFT minting utility
│   │   │
│   │   ├── Dockerfile.mongo          # MongoDB Docker config
│   │   ├── init-mongo.js             # MongoDB init script
│   │   ├── build.config.ts           # Unbuild configuration
│   │   ├── jest.config.js            # Jest test config
│   │   ├── tsconfig.json             # TypeScript config
│   │   ├── package.json              # Dependencies & scripts
│   │   ├── .env.example              # Example environment vars
│   │   └── README.md                 # Backend documentation
│   │
│   └── dca-frontend/                 # Frontend package
│       ├── src/
│       │   ├── pages/                # React pages
│       │   │   ├── home.tsx          # Main dashboard
│       │   │   └── login.tsx         # Login/auth page
│       │   │
│       │   ├── components/           # React components
│       │   │   ├── ui/               # shadcn/ui base components
│       │   │   │   ├── button.tsx
│       │   │   │   ├── dialog.tsx
│       │   │   │   ├── input.tsx
│       │   │   │   └── ...
│       │   │   │
│       │   │   ├── active-dcas.tsx   # DCA list display
│       │   │   ├── create-dca.tsx    # DCA creation form
│       │   │   ├── dialogue-*.tsx    # Various dialogs
│       │   │   ├── wallet.tsx        # Wallet connection
│       │   │   └── ...
│       │   │
│       │   ├── hooks/                # Custom React hooks
│       │   │   └── ...               # API hooks, state hooks
│       │   │
│       │   ├── lib/                  # Utility functions
│       │   │   └── utils.ts          # Helper functions
│       │   │
│       │   ├── config/               # Configuration
│       │   ├── stories/              # Storybook stories
│       │   ├── App.tsx               # Main App component
│       │   ├── App.css               # App styles
│       │   ├── main.tsx              # Entry point
│       │   ├── index.css             # Global styles
│       │   ├── config.ts             # App configuration
│       │   └── vite-env.d.ts         # Vite type definitions
│       │
│       ├── .storybook/               # Storybook configuration
│       │   ├── main.ts               # Storybook config
│       │   └── preview.ts            # Preview settings
│       │
│       ├── public/                   # Static assets
│       │   ├── favicon.ico
│       │   └── ...
│       │
│       ├── vite.config.ts            # Vite build config
│       ├── eslint.config.js          # ESLint config
│       ├── tsconfig.json             # TypeScript config
│       ├── components.json           # shadcn/ui config
│       ├── index.html                # HTML entry point
│       ├── package.json              # Dependencies & scripts
│       ├── .env.example              # Example environment vars
│       └── README.md                 # Frontend documentation
│
├── pnpm-workspace.yaml               # PNPM workspace config
├── package.json                      # Root package config
├── tsconfig.base.json                # Shared TS config
├── tsconfig.json                     # Root TS config
├── .eslintrc.cjs                     # Shared ESLint config
├── .eslintignore                     # ESLint ignore patterns
├── .prettierrc                       # Prettier config
├── .prettierignore                   # Prettier ignore patterns
├── .editorconfig                     # Editor configuration
├── .lintstagedrc.json                # Lint-staged config
├── .gitignore                        # Git ignore patterns
├── .nvmrc                            # Node version
├── Procfile                          # Deployment config
├── pnpm-lock.yaml                    # Locked dependencies
├── README.md                         # Main documentation
├── ARCHITECTURE.md                   # This file!
└── STRUCTURE_DIAGRAM.md              # Visual diagrams (this file)
```

## Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Stack                           │
├─────────────────────────────────────────────────────────────────┤
│ Framework         │ React 19                                     │
│ Build Tool        │ Vite                                         │
│ Language          │ TypeScript                                   │
│ Styling           │ Tailwind CSS v4                              │
│ UI Components     │ shadcn/ui (Radix UI)                         │
│ State Management  │ React Hooks                                  │
│ HTTP Client       │ Fetch API                                    │
│ Auth              │ @lit-protocol/auth-helpers                   │
│ Vincent SDK       │ @lit-protocol/vincent-app-sdk                │
│ Error Tracking    │ Sentry React                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Backend Stack                            │
├─────────────────────────────────────────────────────────────────┤
│ Runtime           │ Node.js 22                                   │
│ Framework         │ Express.js                                   │
│ Language          │ TypeScript                                   │
│ Build Tool        │ Unbuild                                      │
│ Database          │ MongoDB (via Mongoose)                       │
│ Job Scheduler     │ Agenda.js                                    │
│ Authentication    │ JWT (did-jwt)                                │
│ Vincent SDK       │ @lit-protocol/vincent-app-sdk                │
│ Blockchain        │ ethers.js v5                                 │
│ Error Tracking    │ Sentry Node                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Development Tools                             │
├─────────────────────────────────────────────────────────────────┤
│ Package Manager   │ PNPM 10.7.0                                  │
│ Monorepo          │ PNPM Workspaces                              │
│ Linting           │ ESLint (Airbnb config)                       │
│ Formatting        │ Prettier                                     │
│ Git Hooks         │ Husky + lint-staged                          │
│ Testing (Backend) │ Jest                                         │
│ Testing (Frontend)│ Vitest + Playwright                          │
│ Component Dev     │ Storybook                                    │
│ Env Management    │ dotenvx                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Vincent Platform                              │
├─────────────────────────────────────────────────────────────────┤
│ Core SDK          │ @lit-protocol/vincent-app-sdk                │
│ Scaffold          │ @lit-protocol/vincent-scaffold-sdk           │
│ Contracts         │ @lit-protocol/vincent-contracts-sdk          │
│ Lit Protocol      │ @lit-protocol/lit-node-client                │
│ Auth              │ @lit-protocol/auth-helpers                   │
│ Abilities         │ • vincent-ability-erc20-approval             │
│                   │ • vincent-ability-uniswap-swap               │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────────┐
│                          Internet                                │
└────────────────────┬─────────────────┬──────────────────────────┘
                     │                 │
                     │                 │
            ┌────────▼────────┐   ┌────▼────────────┐
            │                 │   │                 │
            │  Frontend       │   │  Backend        │
            │  (Static Host)  │   │  (Server)       │
            │                 │   │                 │
            │  • Vercel       │   │  • Railway      │
            │  • Netlify      │   │  • Heroku       │
            │  • AWS S3       │   │  • AWS EC2      │
            │                 │   │                 │
            └─────────────────┘   └────┬─────┬──────┘
                                       │     │
                      ┌────────────────┘     └──────────────┐
                      │                                     │
              ┌───────▼────────┐                   ┌────────▼──────┐
              │                │                   │               │
              │  MongoDB       │                   │  Vincent      │
              │  (Atlas)       │                   │  Platform     │
              │                │                   │               │
              └────────────────┘                   └───────────────┘
```

This diagram shows how the production deployment would typically be structured with separate hosting for frontend (static), backend (server), database (managed service), and integration with the Vincent platform.
