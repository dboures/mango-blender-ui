import { Button, FormControl, Grid, Paper, TextField } from "@mui/material";
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
      <div className="row" style = {{ display: 'flex', justifyContent: 'center', alignContent: 'center'}}>
    {
    wallet?.connected ? (
      <Paper style={{width: 500, marginTop: 15, marginBottom: 15, backgroundColor: '#2A2440' }} elevation={3}> 
         <Grid container spacing={2}>
         <Grid style = {{ display: 'flex', justifyContent: 'center', alignContent: 'center'}} item xs={12}>
         <h2 style={{color: '#fff'}}> Create New Pool</h2>
         </Grid>
          
         <Grid item xs={1}></Grid>
              <Grid item xs={8} style = {{ display: 'flex', justifyContent: 'center', alignContent: 'center', marginBottom: 15, color:'#fff'}}>
              <FormControl fullWidth>
                  <TextField
                    id="outlined-basic"
                    label="Pool Name"
                    variant="outlined"
                    value={newPoolName}
                    onChange={(e) => setNewPoolName(e.target.value)}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={2}>
              <Button disabled={newPoolName.length <= 0 && wallet?.connected} onClick={() => handleCreatePool()}>Create Pool</Button>
            <Grid item xs={1}></Grid>
            </Grid>
            {/* <Grid item xs={2}></Grid>
              <Grid item xs={6}>
                Pool Details here
              </Grid>
            */}
            </Grid> 
              </Paper>
    ): (<h2 style={{color: 'white'}}>Please Connect Wallet</h2>) 
    }

      </div>
      <div className="row">
        <Pools/>
      </div>
    </>
  );
}

export default Home;
