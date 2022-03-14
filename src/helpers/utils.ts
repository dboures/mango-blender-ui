import { BN, Program, Provider } from "@project-serum/anchor";
import { SolanaProvider } from "@saberhq/solana-contrib";
import { Commitment, PublicKey } from "@solana/web3.js";
import data from "../mango_blender.json";
require("dotenv").config();

export let SERUM_PROG_ID: PublicKey;
export let MANGO_PROG_ID: PublicKey;
export let ENDPOINT: string;

if (process.env.REACT_APP_NETWORK === 'MAINNET') {
    SERUM_PROG_ID = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin');
    MANGO_PROG_ID = new PublicKey("F2DZJhWauzr9jYcRi6MJWJd7D3SNwR1f5fDQj5oT9ofc");
    ENDPOINT = process.env.REACT_APP_MAINNET_ENDPOINT as string;

} else if (process.env.REACT_APP_NETWORK === 'DEVNET') {
    SERUM_PROG_ID = new PublicKey('DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY');
    MANGO_PROG_ID = new PublicKey("37jcHpnX5vngZGtj11EJLPmefkx67shdQp8bVkHYaZwb");
    ENDPOINT = process.env.REACT_APP_DEVNET_ENDPOINT as string;
} else {
  throw new Error(`Network unrecognized. Should be mainnet or devnet. Currently: ${process.env.NETWORK}`);
}

export const COMMITTMENT: Commitment = 'processed';

export const ZERO_BN = new BN(0);

export function loadProgram(provider: SolanaProvider): Program {
  const anchorProvider = new Provider(provider.connection, provider.wallet, {
    commitment: COMMITTMENT,
  });
  const idl = JSON.parse(JSON.stringify(data));
  return new Program(idl, MANGO_PROG_ID, anchorProvider);
}