import {
  MangoCache,
  MangoClient,
  MangoGroup,
  NodeBank,
  QUOTE_INDEX,
  RootBank,
} from "@blockworks-foundation/mango-client";
import { BN, Program, Provider } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Commitment, PublicKey } from "@solana/web3.js";
import data from "../mango_blender.json";
require("dotenv").config();

export let SERUM_PROG_ID: PublicKey;
export let MANGO_PROG_ID: PublicKey;
export let quoteTokenMint: PublicKey;
export let mangoGroupPubkey: PublicKey;
export const BLENDER_PROG_ID = new PublicKey(
  "HzJMW7y12YSPDZMWNeqKDR51QnHwhF3TB96CZsPhpNoB"
);
export let ENDPOINT: string;

if (process.env.REACT_APP_NETWORK === "MAINNET") {
  console.log("mainnet");
  SERUM_PROG_ID = new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");
  MANGO_PROG_ID = new PublicKey("F2DZJhWauzr9jYcRi6MJWJd7D3SNwR1f5fDQj5oT9ofc");
  ENDPOINT = process.env.REACT_APP_MAINNET_ENDPOINT as string;
  //TODO: use IDS.json
  quoteTokenMint = new PublicKey(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  );
  mangoGroupPubkey = new PublicKey(
    "98pjRuQjK3qA6gXts96PqZT4Ze5QmnCmt3QYjhbUSPue"
  );
} else if (process.env.REACT_APP_NETWORK === "DEVNET") {
  console.log("devnet");
  SERUM_PROG_ID = new PublicKey("DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY");
  MANGO_PROG_ID = new PublicKey("4skJ85cdxQAFVKbcGgfun8iZPL7BadVYXG3kGEGkufqA");
  ENDPOINT = process.env.REACT_APP_DEVNET_ENDPOINT as string;
  //TODO: use IDS.json
  quoteTokenMint = new PublicKey(
    "8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN"
  );
  mangoGroupPubkey = new PublicKey(
    "Ec2enZyoC4nGpEfu2sUNAa2nUGJHWxoUWYSEJ2hNTWTA" // devnet.2
  );
} else {
  throw new Error(
    `Network unrecognized. Should be mainnet or devnet. Currently: ${process.env.NETWORK}`
  );
}

export const COMMITTMENT: Commitment = "processed";

export const ZERO_BN = new BN(0);

export function loadProgram(provider: Provider): Program {
  const idl = JSON.parse(JSON.stringify(data));
  return new Program(idl, BLENDER_PROG_ID, provider);
}

export async function findAssociatedTokenAddress(
  provider: Provider,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  );
  return (
    await PublicKey.findProgramAddress(
      [
        provider.wallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
  )[0];
}

export async function getOrCreateATA(provider: Provider, mint: PublicKey) {
  const address = await findAssociatedTokenAddress(provider, mint);
  const accountInfo = await provider.connection.getAccountInfo(address);
  if (accountInfo) {
    return { address, instruction: null };
  } else {
    return {
      address,
      instruction: Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        address,
        provider.wallet.publicKey,
        provider.wallet.publicKey
      ),
    };
  }
}

export async function derivePoolOwnedMangoAccount(
  poolAddress: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [
      mangoGroupPubkey.toBytes(),
      poolAddress.toBytes(),
      new BN(1).toArrayLike(Buffer, "le", 8), // account_num
    ],
    MANGO_PROG_ID
  );
}

export async function derivePoolAddress(
  poolName: string,
  poolAdminPubkey: PublicKey
): Promise<[PublicKey, number]> {
  const poolNameBytes = utf8.encode(poolName);
  return PublicKey.findProgramAddress(
    [poolNameBytes, poolAdminPubkey.toBytes()],
    BLENDER_PROG_ID
  );
}

export async function derivePoolIouAddress(
  poolName: string,
  poolAdminPubkey: PublicKey
): Promise<[PublicKey, number]> {
  const poolNameBytes = utf8.encode(poolName);
  return PublicKey.findProgramAddress(
    [poolNameBytes, poolAdminPubkey.toBytes(), utf8.encode("iou")],
    BLENDER_PROG_ID
  );
}

export async function loadMangoObjects(
  provider: Provider
): Promise<[MangoGroup, MangoCache, RootBank, NodeBank[]]> {
  const client = new MangoClient(provider.connection, MANGO_PROG_ID);
  const mangoGroup = await client.getMangoGroup(mangoGroupPubkey);
  const [rootBanks, mangoCache] = await Promise.all([
    mangoGroup.loadRootBanks(provider.connection),
    mangoGroup.loadCache(provider.connection),
  ]);
  const nodeBanks = await rootBanks[QUOTE_INDEX]?.loadNodeBanks(
    provider.connection
  );
  if (!rootBanks[QUOTE_INDEX]) {
    throw new Error("Error loading quote root bank");
  }
  if (!nodeBanks) {
    throw new Error("Error loading node banks");
  }
  const quoteRootBank = rootBanks[QUOTE_INDEX] as RootBank;
  return [mangoGroup, mangoCache, quoteRootBank, nodeBanks];
}
