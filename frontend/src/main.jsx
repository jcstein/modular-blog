import "./polyfills";
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  // Comment out line below if using ONLY Ethermint Testnet
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
// Comment out line below if using ONLY Ethermint Testnet
// import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
// Comment out line below if using Ethermint and localhost
import { publicProvider } from 'wagmi/providers/public';
import { injectedWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';

/* create configuration for Ethermint testnet */
const ethermint = {
  id: 69420,
  name: 'Ethermint',
  network: 'ethermint',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethermint',
    symbol: 'EMINT',
  },
  rpcUrls: {
    default: {
      http: ['http://159.65.252.178:8545/'],
    },
  },
  testnet: true,
};

// Use code below if using Ethermint and localhost
const { chains, provider } = configureChains( 
  [chain.localhost, ethermint],
  [publicProvider()]
);

// Use code below if using ONLY Ethermint Testnet
// const { provider, chains } = configureChains(
//   [ethermint],
//   [
//     jsonRpcProvider({
//       rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
//     }),
//   ]
// );

/* DEBUG */
// const avalancheChain = {
//   id: 43_114,
//   name: 'Avalanche',
//   network: 'avalanche',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Avalanche',
//     symbol: 'AVAX',
//   },
//   rpcUrls: {
//     default: {
//       http: ['https://api.avax.network/ext/bc/C/rpc'],
//     },
//   },
//   testnet: false,
// };

// const { provider, chains } = configureChains(
//   [avalancheChain],
//   [
//     jsonRpcProvider({
//       rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
//     }),
//   ]
// );

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ chains }),
      injectedWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

const containerStyle = {
  width: '900px',
  margin: '0 auto'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <div style={containerStyle}>
        <App />
      </div>
    </RainbowKitProvider>
  </WagmiConfig>
)