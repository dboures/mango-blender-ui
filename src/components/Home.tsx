import { Button } from "@mui/material";
import { Provider } from "@project-serum/anchor";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import React from "react";
import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { quoteTokenMint } from "../helpers/utils";
import { loadQuoteBalance } from "../services/service.balance";
import { createPool } from "../services/service.pool";
import Pools from "./Pools";

export interface Balance {
    name: string;
    amount: number;
    mintAddress: string;
  }

function Home() {
  const connection = useConnection().connection;
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet() as AnchorWallet;
  const provider = new Provider(connection, anchorWallet, {});

  // useState here
  const [quoteBalance, setQuoteBalance] = React.useState(0);
  const [newPoolName, setNewPoolName] = React.useState("");


  const refreshWalletBalances = () => { // TODO: load other balances?
    loadQuoteBalance(provider).then((updatedQuoteBalance) => {
      setQuoteBalance(updatedQuoteBalance.amount);
    });
  };


  useEffect(() => {
    // refreshTrader();
    refreshWalletBalances();
  }, [wallet?.connected]);


  const handleCreatePool = () => {
    createPool(newPoolName, provider);
    // .then(() => {
    //   refreshTrader();
    // });
  };

  return (
    <>
      <div className="row">
        <h2>Balance Here</h2>
        {quoteBalance}
        <h2>Mint Here</h2>
        {quoteTokenMint.toBase58()}
        {wallet.connected ? ( // <span>Trader Account: {trader}</span>
          <Button onClick={() => handleCreatePool()}>Create Pool</Button>
        ) : null}
        <h3>Input</h3>
         <input type="text" name="newPoolName" value={newPoolName} onChange={e => setNewPoolName(e.target.value)} />
      </div>
      <div className="row">
        <Pools/>
      </div>
    </>
  );
}

export default Home;
