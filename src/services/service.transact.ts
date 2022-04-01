import { BN, Provider } from "@project-serum/anchor";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  derivePoolOwnedMangoAccount,
  findAssociatedTokenAddress,
  getOrCreateATA,
  loadMangoObjects,
  loadProgram,
  MANGO_PROG_ID,
  quoteTokenMint,
  SERUM_PROG_ID,
} from "../other/utils";
import { MangoClient, uiToNative } from "@blockworks-foundation/mango-client";
import { Pool } from "../components/Pools";
import { getMintInfo } from "@project-serum/common";

export async function buyIntoPool(
  provider: Provider,
  pool: Pool,
  uiQuoteAmount: number
) {
  try {
    const client = new MangoClient(provider.connection, MANGO_PROG_ID);
    const program = loadProgram(provider);
  
    const quoteMintInfo = await getMintInfo(provider, quoteTokenMint);
    const depositQuoteQuantity = uiToNative(
      uiQuoteAmount,
      quoteMintInfo.decimals
    );
  
    const [mangoAccount, [mangoGroup, mangoCache, quoteRootBank, nodeBanks]] =
      await Promise.all([
        client.getMangoAccount(pool.mangoAccount, SERUM_PROG_ID),
        loadMangoObjects(provider),
      ]);
  
    const [buyerQuoteATA, buyerIouATAResult] = await Promise.all([
      findAssociatedTokenAddress(provider, quoteTokenMint),
      getOrCreateATA(provider, pool.iouMint),
    ]);

    // todo: fix this
    const admin = new PublicKey("BfTKqcd3K8GFz2FrRMY7sDY5nqYuYazGPKoY26zSr2mR")
    const fanoutIouATA = new PublicKey("9VUGCqGwPa4brZHJ5P9EPBUYWGqaPMMegZVuKMFku84k")
    const fanoutQuoteATA = new PublicKey("2TdnkohtM2YggGVBTgAL4xFV3HatHb3rAWhv56YDa8zJ")
    const fanout = new PublicKey("A2PNtUCVzM5iK7ePQCa9Tdf4HHwzjkzYMju613QH9Ufu")
    
    const openOrdersKeys = mangoAccount.getOpenOrdersKeysInBasket();
    const remainingAccounts = openOrdersKeys.map((key) => {
      return { pubkey: key, isWritable: false, isSigner: false };
    });
  
    const transaction = new Transaction();
    if (buyerIouATAResult.instruction) {
      transaction.add(buyerIouATAResult.instruction);
    }
  
    const instruction = await program.instruction.buyIntoPool(
      depositQuoteQuantity,
      {
        accounts: {
          admin: admin,
          fanout: fanout,
          fanoutIouTokenAccount: fanoutIouATA,
          fanoutTokenAccount: fanoutQuoteATA,
          mangoProgram: MANGO_PROG_ID,
          pool: pool.key,
          mangoGroup: mangoGroup.publicKey,
          mangoAccount: mangoAccount.publicKey,
          depositor: provider.wallet.publicKey,
          depositorQuoteTokenAccount: buyerQuoteATA,
          mangoCache: mangoCache.publicKey,
          rootBank: quoteRootBank.publicKey,
          nodeBank: nodeBanks[0].publicKey,
          vault: nodeBanks[0].vault,
          poolIouMint: pool.iouMint,
          depositorTokenAccount: buyerQuoteATA,
          depositorIouTokenAccount: buyerIouATAResult.address,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        remainingAccounts,
      }
    );
  
    transaction.add(instruction);
    const tx = await provider.send(transaction, [], {});
    console.log(tx);
    return true
  } catch(error) {
    console.log(error)
    return false
  }
}

export async function redeemFromPool(
  provider: Provider,
  pool: Pool,
  uiQuoteAmount: number
): Promise<boolean> {
  try {
    const client = new MangoClient(provider.connection, MANGO_PROG_ID);
    const program = loadProgram(provider);
  
    const quoteMintInfo = await getMintInfo(provider, quoteTokenMint);
    const withdrawQuoteQuantity = uiToNative(
      uiQuoteAmount,
      quoteMintInfo.decimals
    );
  
    const [mangoAccount, [mangoGroup, mangoCache, quoteRootBank, nodeBanks]] =
      await Promise.all([
        client.getMangoAccount(pool.mangoAccount, SERUM_PROG_ID),
        loadMangoObjects(provider),
      ]);
    const [withdrawerIouATA, withdrawerQuoteATAResult] = await Promise.all([
      findAssociatedTokenAddress(provider, pool.iouMint),
      getOrCreateATA(provider, quoteTokenMint),
    ]);

        // todo: fix this

    const admin = new PublicKey("BfTKqcd3K8GFz2FrRMY7sDY5nqYuYazGPKoY26zSr2mR")
    const fanoutIouATA = new PublicKey("9VUGCqGwPa4brZHJ5P9EPBUYWGqaPMMegZVuKMFku84k")
    const fanoutQuoteATA = new PublicKey("2TdnkohtM2YggGVBTgAL4xFV3HatHb3rAWhv56YDa8zJ")
    const fanout = new PublicKey("A2PNtUCVzM5iK7ePQCa9Tdf4HHwzjkzYMju613QH9Ufu")

    /*
  
    const [adminIouATA, adminQuoteATA] = await Promise.all([
      findAssociatedTokenAddress(provider, pool.iouMint),
      getOrCreateATA(provider, quoteTokenMint),
    ]);

    */
    const openOrdersKeys = mangoAccount.getOpenOrdersKeysInBasket();
    const remainingAccounts = openOrdersKeys.map((key) => {
      return { pubkey: key, isWritable: false, isSigner: false };
    });
  
    const transaction = new Transaction();
    if (withdrawerQuoteATAResult.instruction) {
      transaction.add(withdrawerQuoteATAResult.instruction);
    }
  
    const instruction = await program.instruction.withdrawFromPool(
      withdrawQuoteQuantity,
      {
        accounts: {
          admin: admin,
          fanout: fanout,
          fanoutIouTokenAccount: fanoutIouATA,
          fanoutTokenAccount: fanoutQuoteATA,
          mangoProgram: MANGO_PROG_ID,
          pool: pool.key,
          mangoGroup: mangoGroup.publicKey,
          mangoGroupSigner: mangoGroup.signerKey,
          mangoAccount: mangoAccount.publicKey,
          withdrawer: provider.wallet.publicKey,
          withdrawerTokenAccount: withdrawerQuoteATAResult.address,
          mangoCache: mangoCache.publicKey,
          rootBank: quoteRootBank.publicKey,
          nodeBank: nodeBanks[0].publicKey,
          vault: nodeBanks[0].vault,
          poolIouMint: pool.iouMint,
          withdrawerIouTokenAccount: withdrawerIouATA,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        remainingAccounts,
      }
    );
  
    transaction.add(instruction);
    const tx = await provider.send(transaction, [], {});
    console.log(tx);
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
