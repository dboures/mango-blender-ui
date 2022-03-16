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
import { Pool } from "../components/Pools";
import {
  derivePoolAddress,
  derivePoolIouAddress,
  derivePoolOwnedMangoAccount,
  loadProgram,
  mangoGroupPubkey,
  MANGO_PROG_ID,
} from "../other/utils";
import { calculatePoolShare } from "./service.stats";

export async function createPool(poolName: string, provider: Provider): Promise<boolean> {
  try {
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
      await derivePoolOwnedMangoAccount(poolAddress);
  
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
    const tx = await provider.send(transaction, [], {});
    console.log(tx);
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export async function fetchPools(provider: Provider): Promise<Pool[]> { // TODO: refactor
  const program = loadProgram(provider);
  const rawPools = await program.account.pool.all(); // FUTURE: could use memcmp/offset?
  const pools = await Promise.all(
    rawPools.map(async (rawPool) => {
      const [mangoAccount] = await derivePoolOwnedMangoAccount(
        rawPool.publicKey
      );
      let pool = {
        key: rawPool.publicKey,
        poolName: rawPool.account.poolName,
        poolBump: rawPool.account.poolBump,
        iouMintBump: rawPool.account.iouMintBump,
        iouMint: rawPool.account.iouMint,
        admin: rawPool.account.admin,
        mangoAccount,
      } as Pool;
      const share = await calculatePoolShare(provider, pool);
      pool.share = share;
      return pool
    })
  );
  return pools.sort((a, b) =>
    a.poolName > b.poolName ? 1 : b.poolName > a.poolName ? -1 : 0
  );
}
