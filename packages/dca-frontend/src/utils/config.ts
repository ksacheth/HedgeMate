import { http, createConfig } from 'wagmi';
import { base, mainnet, sepolia } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';

const projectId = 'b6294c95f6d31e57b8b7e602b618987d';

export const config = createConfig({
  chains: [mainnet, base, sepolia],
  connectors: [walletConnect({ projectId }), metaMask()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
});
