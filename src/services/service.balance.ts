import { Provider } from "@project-serum/anchor";
import { Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { Balance } from "../components/Home";
import { Pool } from "../components/Pools";
import { findAssociatedTokenAddress, quoteTokenMint } from "../helpers/utils";

const emptyBalance = {
  name: "USDC",
  amount: 0,
  mintAddress: "",
  providerAddress: "",
} as Balance;

export async function loadQuoteBalance(provider: Provider): Promise<Balance> {
  if (provider?.wallet?.publicKey) {
    const quoteATA = await findAssociatedTokenAddress(provider, quoteTokenMint);
    const tokenData = await provider.connection.getParsedAccountInfo(quoteATA);
    if (tokenData.value) {
      const tokenInfo = (tokenData.value?.data as ParsedAccountData).parsed
        .info;

      const tokenMint = tokenInfo.mint;
      const tokenAmount = tokenInfo.tokenAmount.uiAmount;
      return {
        name: "USDC",
        amount: tokenAmount,
        mintAddress: tokenMint,
        providerAddress: quoteATA.toBase58(),
      } as Balance;
    }
  }
  return emptyBalance;
}

export async function loadIouBalance(provider: Provider, pool: Pool){
  if (provider?.wallet?.publicKey) {
    const iouATA = await findAssociatedTokenAddress(provider, pool.iouMint);
    const tokenData = await provider.connection.getParsedAccountInfo(iouATA);
    if (tokenData.value) {
      const tokenInfo = (tokenData.value?.data as ParsedAccountData).parsed
        .info;

      const tokenMint = tokenInfo.mint;
      const tokenAmount = tokenInfo.tokenAmount.uiAmount;
      console.log(tokenInfo);
      return {
        name: "IOU",
        amount: tokenAmount,
        mintAddress: tokenMint,
        providerAddress: iouATA.toBase58(),
      } as Balance;
    }
  }
  return emptyBalance;
}
