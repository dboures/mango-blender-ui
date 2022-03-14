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
// import Header from "./components/Header";
// import Home from "./components/Home";
// import "./App.css";
// import { BrowserRouter } from "react-router-dom";
import { ENDPOINT } from "./helpers/utils";


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
      <ConnectionProvider endpoint={ENDPOINT}>
        <WalletProvider wallets={wallets}>
          gm
          {/* <SnackBarProvider>
            <BrowserRouter> */}
              {/* <Header />
              <Home /> */}
              {/* <Sample /> */}
            {/* </BrowserRouter>
          </SnackBarProvider> */}
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;
