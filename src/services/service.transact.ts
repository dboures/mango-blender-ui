import { BN, Provider } from "@project-serum/anchor";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { findAssociatedTokenAddress, getOrCreateATA, loadMangoObjects, loadProgram, MANGO_PROG_ID, quoteTokenMint, SERUM_PROG_ID } from "../helpers/utils";
import {
    MangoClient, uiToNative,
  } from "@blockworks-foundation/mango-client";
import { Pool } from "../components/Pools";
import { getMintInfo } from "@project-serum/common";

export async function buyIntoPool(provider: Provider, pool: Pool, uiQuoteAmount: number) {
    const client = new MangoClient(provider.connection, MANGO_PROG_ID);
    const program = loadProgram(provider);

    const quoteMintInfo = await getMintInfo(provider, quoteTokenMint);
    const depositQuoteQuantity = uiToNative(uiQuoteAmount, quoteMintInfo.decimals)

    const [mangoAccount, [mangoGroup, mangoCache, quoteRootBank, nodeBanks]] = await Promise.all([
        client.getMangoAccount(
            pool.mangoAccount,
            SERUM_PROG_ID
          ),
          loadMangoObjects(provider)
    ]);

    const [buyerQuoteATA, buyerIouATAResult] = await Promise.all([
        findAssociatedTokenAddress(provider.wallet.publicKey, quoteTokenMint),
        getOrCreateATA(provider, pool.iouMint)
    ]);


    const openOrdersKeys = mangoAccount.getOpenOrdersKeysInBasket();
    const remainingAccounts = openOrdersKeys.map((key) => {
    return { pubkey: key, isWritable: false, isSigner: false };
    });

    const transaction = new Transaction();
    if(buyerIouATAResult.instruction) {
        transaction.add(buyerIouATAResult.instruction)
    }


    const instruction = await program.instruction.buyIntoPool(depositQuoteQuantity, {
        accounts: {
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
          depositorIouTokenAccount: buyerIouATAResult.address,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        remainingAccounts,
      });

      transaction.add(instruction);
      const tx = await provider.send(transaction, [], {});
      console.log(tx);
}