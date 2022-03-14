import { Provider } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  ParsedAccountData,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  derivePoolAddress,
  derivePoolIouAddress,
  derviePoolOwnedMangoAccount,
  loadProgram,
  mangoGroupPubkey,
  MANGO_PROG_ID,
} from "../helpers/utils";

export async function createPool(poolName: string, provider: Provider) {
  const program = loadProgram(provider);
  const poolNameBytes = utf8.encode(poolName);
  const [poolAddress, poolBump] = await derivePoolAddress(
    poolName,
    provider.wallet.publicKey
  );
  const [poolIouAddress, poolIouBump] = await derivePoolIouAddress(
    poolName,
    provider.wallet.publicKey
  );
  const [mangoAccountAddress, mangoAccountBump] =
    await derviePoolOwnedMangoAccount(poolAddress);

  const transaction = new Transaction();
  const instruction = await program.instruction.createPool(
    poolNameBytes,
    poolBump,
    poolIouBump,
    {
      accounts: {
        pool: poolAddress,
        poolIouMint: poolIouAddress,
        admin: provider.wallet.publicKey,
        mangoProgram: MANGO_PROG_ID,
        mangoGroup: mangoGroupPubkey,
        mangoAccount: mangoAccountAddress,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  );

  transaction.add(instruction);
  const tx = await provider.send(transaction, [], {skipPreflight: true});
  console.log(tx);
}
