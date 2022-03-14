import { Provider } from "@project-serum/anchor";
import { Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { Balance } from "../components/Home";
import { findAssociatedTokenAddress, quoteTokenMint } from "../helpers/utils";

const emptyBalance = {
  name: "USDC",
  amount: 0,
  mintAddress: "",
  providerAddress: "",
} as Balance;

export async function loadQuoteBalance(provider: Provider): Promise<Balance> {
  if (provider?.wallet?.publicKey) {
    const quoteATA = await findAssociatedTokenAddress(
      provider.wallet.publicKey,
      quoteTokenMint
    );
    const tokenData = await provider.connection.getParsedAccountInfo(quoteATA);
    if (tokenData.value) {
      const tokenInfo = (tokenData.value?.data as ParsedAccountData).parsed
        .info;
      console.log(tokenInfo);

      // get USDC token account
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
