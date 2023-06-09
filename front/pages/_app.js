import '@/styles/globals.css'

import { ChakraProvider } from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { hardhat, polygonMumbai, goerli,sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import ClientOnly from '@/components/clientonly';

const { chains, provider } = configureChains(
  [hardhat, goerli, polygonMumbai,sepolia],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export default function App({ Component, pageProps }) {
    
  return (
    <ClientOnly>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
    </ClientOnly>
  )
}
