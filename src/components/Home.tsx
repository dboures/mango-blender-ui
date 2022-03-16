import { Button, FormControl, Grid, TextField } from "@mui/material";
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
import { useSnackBar } from "../other/SnackbarContext";
import { quoteTokenMint } from "../other/utils";
import { loadQuoteBalance } from "../services/service.balance";
import { createPool } from "../services/service.pool";
import Pools, { Pool } from "./Pools";

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
  const snackBarActions = useSnackBar();

  const refreshWalletBalances = () => { // TODO: load other balances?
    loadQuoteBalance(provider).then((updatedQuoteBalance) => {
      setQuoteBalance(updatedQuoteBalance.amount);
    });
  };

  useEffect(() => {
    // refreshTrader();
    refreshWalletBalances();
  }, [wallet?.connected]);


  const handleCreatePool = async() => {
    const success = await createPool(newPoolName, provider);
    if (success) {
      snackBarActions.showSnackBar("Pool created", "success");
      setNewPoolName("");
    } else {
      snackBarActions.showSnackBar("Error, please try again", "error");
    }
  };

  return (
    <>
      <div className="row">
        {/* <h2>Balance Here</h2>
        {quoteBalance}
        <h2>Mint Here</h2>
        {quoteTokenMint.toBase58()}
        
        <h3>Input</h3>
         <input type="text" name="newPoolName" value={newPoolName} onChange={e => setNewPoolName(e.target.value)} /> */}

         <Grid container spacing={2}>
              <Grid item xs={2}>
              <FormControl fullWidth>
                  <TextField
                    id="outlined-basic"
                    label="Pool Name"
                    variant="outlined"
                    type="number"
                    value={newPoolName}
                    onChange={(e) => setNewPoolName(e.target.value)}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={2}>
                {wallet.connected ? ( // <span>Trader Account: {trader}</span>
              <Button disabled={newPoolName.length <= 0} onClick={() => handleCreatePool()}>Create Pool</Button>
            ) : null}
            </Grid>
            {/* <Grid item xs={2}></Grid>
              <Grid item xs={6}>
                Pool Details here
              </Grid>
            */}
              
            </Grid> 
      </div>
      <div className="row">
        <Pools/>
      </div>
    </>
  );
}

export default Home;
