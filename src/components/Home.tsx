import { Button, FormControl, Grid, Paper, Input, TextField } from "@mui/material";
import { Provider } from "@project-serum/anchor";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {Fanout, FanoutClient, FanoutMembershipVoucher, FanoutMint, MembershipModel} from "@glasseaters/hydra-sdk";


import { PublicKey } from "@blockworks-foundation/mango-client";
import React, {useState} from "react";
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

  const admin = new PublicKey("BfTKqcd3K8GFz2FrRMY7sDY5nqYuYazGPKoY26zSr2mR")
  const mintPublicKey = new PublicKey("7pWNBn8QrAVafM7QKiAUAPRh9XHkUoBEPTLW86L5VXdv")
  const usdcMint = new PublicKey("8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN")
  const fanout = new PublicKey("A2PNtUCVzM5iK7ePQCa9Tdf4HHwzjkzYMju613QH9Ufu")
  var [shares, setShares] = useState("1.38");
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
  async function doit(){

    if (wallet){
      // @ts-ignore
      var account = await connection.getTokenAccountsByOwner(wallet.publicKey, {
        mint: mintPublicKey});
        console.log(account.value[0].pubkey.toString());
      var fromTokenAccount = account.value[0].pubkey
      var fanoutSdk: FanoutClient;
      fanoutSdk = new FanoutClient(
        connection,
        // @ts-ignore
        wallet
    );
    console.log( (parseFloat(shares) * 10 ** 6))
  var  ixs = await fanoutSdk.stakeTokenMemberInstructions(
          {
              
              shares:  (parseFloat(shares) * 10 ** 6),
              fanout: fanout,
              membershipMintTokenAccount: fromTokenAccount,
              membershipMint: mintPublicKey,
             // @ts-ignore
              member: wallet.publicKey,
              // @ts-ignore
              payer: wallet.publicKey
          }
      );var tx = await fanoutSdk.sendInstructions(
        ixs.instructions,
        [],
        // @ts-ignore
        wallet.publicKey
    );
  
  }
    }
  
    async function us(){
  
      if (wallet){
        var fanoutSdk: FanoutClient;
        fanoutSdk = new FanoutClient(
          connection,
          // @ts-ignore
          wallet
      );
      
      await fanoutSdk.unstakeTokenMember({
        fanout: fanout,
        // @ts-ignore
        member: wallet.publicKey,
        // @ts-ignore
        payer: wallet.publicKey
    }
    );
      }
  
    }
    async function onChange(e: any){
      e.preventDefault()
      console.log(e.target.value)
      setShares(e.target.value)
    }
    async function claim(){
      if (wallet){    var fanoutSdk: FanoutClient;
        fanoutSdk = new FanoutClient(
          connection,
          // @ts-ignore
          wallet
      );
     // @ts-ignore
      var account = await connection.getTokenAccountsByOwner(wallet.publicKey, {
        mint: mintPublicKey});
        console.log(account.value[0].pubkey);
      var fromTokenAccount = account.value[0].pubkey
    var ix = await fanoutSdk.distributeTokenMemberInstructions(
      {
        membershipMintTokenAccount: fromTokenAccount,
           
        distributeForMint: true,
        fanout: fanout,
        fanoutMint: mintPublicKey,
        membershipMint: mintPublicKey,
       // @ts-ignore
        member: wallet.publicKey,
        // @ts-ignore
        payer: wallet.publicKey
  
      }
    );
    let megaInst = []
  for (var i in ix.instructions){
    // @ts-ignore
    megaInst.push(ix.instructions[i])
  }
        console.log(account.value[0].pubkey);
    var fromTokenAccount = account.value[0].pubkey
  var ix = await fanoutSdk.distributeTokenMemberInstructions(
    {
      membershipMintTokenAccount: fromTokenAccount,
         
      distributeForMint: true,
      fanout: fanout,
      fanoutMint: usdcMint,
      membershipMint: mintPublicKey,
     // @ts-ignore
      member: wallet.publicKey,
      // @ts-ignore
      payer: wallet.publicKey
  
    }
  );
  for (var i in ix.instructions){
    // @ts-ignore
    megaInst.push(ix.instructions[i])
  }

  // @ts-ignore

  var fromTokenAccount = account.value[0].pubkey
var ix = await fanoutSdk.distributeTokenMemberInstructions(
  {
    membershipMintTokenAccount: fromTokenAccount,
       
    distributeForMint: false,
    fanout: fanout,
    membershipMint: mintPublicKey,
   // @ts-ignore
    member: wallet.publicKey,
    // @ts-ignore
    payer: wallet.publicKey

  }
);

for (var i in ix.instructions){
  // @ts-ignore
  megaInst.push(ix.instructions[i])
}

var  tx2 = await fanoutSdk.sendInstructions(
  megaInst,
  [],
  // @ts-ignore
  wallet.publicKey
);
      }
    }
  
  return (
    <>
      <div className="row" style = {{ display: 'flex', justifyContent: 'center', alignContent: 'center'}}>
    {
    wallet?.connected ? (
      <Paper style={{width: 500, marginTop: 15, marginBottom: 15, backgroundColor: '#2A2440' }} elevation={3}> 
         <Grid container spacing={2}>
         <Grid style = {{ display: 'flex', justifyContent: 'center', alignContent: 'center'}} item xs={12}>
         <h2 style={{color: '#fff'}}> Pool Fanout Actions</h2>
         </Grid>
          
         <Grid item xs={1}></Grid>
              <Grid item xs={8} style = {{ display: 'flex', justifyContent: 'center', alignContent: 'center', marginBottom: 15, color:'#fff'}}>
              <FormControl >
            Shares:
            <Input style={{color: '#fff'}} type="text" onInput={onChange} value={shares} />
            <Button style={{color: '#fff'}} type="submit" onClick={doit} >Stake</Button>
            <Button style={{color: '#fff'}} type="submit" onClick={us} >Unstake All</Button>
            <Button style={{color: '#fff'}} type="submit" onClick={claim} >CLAIM!</Button>


            </FormControl>
            </Grid>
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
