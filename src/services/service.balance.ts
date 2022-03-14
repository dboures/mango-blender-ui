import {
    Connection,
    ParsedAccountData,
    PublicKey
  } from "@solana/web3.js";
import { Balance } from "../components/Home";
import { findAssociatedTokenAddress, quoteTokenMint } from "../helpers/utils";


export async function loadQuoteBalance(connection: Connection, walletPubkey: PublicKey | null): Promise<Balance> {
    if (walletPubkey) {
        const quoteATA = await findAssociatedTokenAddress(walletPubkey, quoteTokenMint)
        const tokenData = await connection.getParsedAccountInfo(quoteATA
          );
        const tokenInfo = (tokenData.value?.data as ParsedAccountData).parsed.info
        console.log(tokenInfo);

        // get USDC token account
        const tokenMint = tokenInfo.mint;
        const tokenAmount =tokenInfo.tokenAmount.uiAmount;
        return {
          name: 'USDC',
          amount: tokenAmount,
          mintAddress: tokenMint,
          providerAddress: quoteATA.toBase58(),
        } as Balance;
    } else {
        return {
            name: 'USDC',
            amount: 0,
            mintAddress: '',
            providerAddress: '',
          } as Balance;
    }
}