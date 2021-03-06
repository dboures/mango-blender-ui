import React, { FC, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  getLedgerWallet,
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getSolletWallet,
  getTorusWallet,
} from "@solana/wallet-adapter-wallets";
import Header from "./components/Header";
import Home from "./components/Home";
// import "./App.css";
import { SnackBarProvider } from "./other/SnackbarContext";
import { ENDPOINT } from "./other/utils";
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const palette = {
  primary: { 
    main: '#1D1832',
    contrastText: "#fff" 
  },
  background: {
    default: '#141026',
  }
};
const themeName = 'mango';

const mangoTheme = createTheme({ palette, themeName });


function App() {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWallet(),
      getTorusWallet({
        options: { clientId: "Get a client ID @ https://developer.tor.us" },
      }),
      getLedgerWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [network]
  );

  return (
    <div className="App">
      <ThemeProvider theme={mangoTheme}>
      <CssBaseline />
      <ConnectionProvider endpoint={ENDPOINT}>
        <WalletProvider wallets={wallets}>
          <SnackBarProvider>
            {/* <BrowserRouter> */}
              <Header />
              <Home />
               {/* <Sample /> 
            </BrowserRouter> */}
          </SnackBarProvider>
        </WalletProvider>
      </ConnectionProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
