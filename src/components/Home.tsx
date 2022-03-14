import { Button } from "@mui/material";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import React from "react";
import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { loadQuoteBalance } from "../services/service.balance";

export interface Balance {
    name: string;
    amount: number;
    mintAddress: string;
  }

function Home() {
  const connection = useConnection().connection;
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet() as AnchorWallet;

  // useState here
  const [quoteBalance, setQuoteBalance] = React.useState(0);


  const refreshWalletBalances = () => { // TODO: load other balances?
    loadQuoteBalance(connection, wallet.publicKey).then((updatedQuoteBalance) => {
      setQuoteBalance(updatedQuoteBalance.amount);
    });
  };


  useEffect(() => {
    // refreshTrader();
    refreshWalletBalances();
  }, [wallet?.connected]);


//   const handleCreatePool = () => {
//     TraderService.createTrader(provider).then(() => {
//       refreshTrader();
//     });
//   };

  return (
    <>
      <div className="row">
        <h2>Dashboard Here</h2>
        {quoteBalance}
        {/* {wallet.connected && trader.length > 0 ? null : wallet.connected ? ( // <span>Trader Account: {trader}</span>
          <Button onClick={() => handleCreateTrader()}>Create Trader</Button>
        ) : null} */}
      </div>
    </>
  );
}

export default Home;
