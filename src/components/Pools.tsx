import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Provider } from "@project-serum/anchor";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import React from "react";
import { useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { fetchPools } from "../services/service.pool";
import TransactModal from "./TransactModal";

export interface Pool {
  key: PublicKey;
  poolName: string;
  poolBump: number;
  iouMintBump: number;
  iouMint: PublicKey;
  admin: PublicKey;
  mangoAccount: PublicKey;
  share? : number;
}

function Pools() {
  const connection = useConnection().connection;
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet() as AnchorWallet;
  const provider = new Provider(connection, anchorWallet, {});

  // useState here
  const [pools, setPools] = React.useState<Pool[]>([]);

  const refreshPools = () => {
    if(wallet?.connected) {
      fetchPools(provider).then((pools: Pool[]) => {
        setPools(pools);
      });
    }
  };

  useEffect(() => {
    // refreshTrader();
    refreshPools();
  }, [wallet?.connected]);

  return (
    <>
      <div className="row">
        { wallet?.connected ? (
          <div className="row">
          <div className="pool-header">
          <h2>Active Pools</h2>
          </div>
          {/* TODO: make table sortable */}
          <TableContainer component={Paper} sx={{maxWidth: 2000, margin: 'auto'}}>
            <Table
              sx={{ minWidth: 650 }}
              size="medium"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Pool Name</TableCell>
                  <TableCell>Pool Key</TableCell>
                  <TableCell>Admin Key</TableCell>
                  <TableCell>View Mango Account</TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell>
                  <span style ={{display: 'flex', justifyContent: 'center'}}>
                  Ownership Share
                            </span>
                            </TableCell>
                  {/* <TableCell>Current Value</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {pools.length > 0
                  ? pools.map((pool: Pool) => {
                      return (
                        <TableRow key={pool.key.toString()}>
                          <TableCell>{pool.poolName}</TableCell>
                          <TableCell>{pool.key.toBase58()}</TableCell>
                          <TableCell>{pool.admin.toBase58()}</TableCell>
                          <TableCell>
                            {/* TODO: mainnet (when it's time) */}
                            <a
                              href={
                                "https://devnet.mango.markets/account?pubkey=" +
                                pool.mangoAccount.toBase58()
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {pool.mangoAccount.toBase58()}
                            </a>
                          </TableCell>
                          <TableCell>
                            <TransactModal provider={provider} pool={pool} action={'deposit'} />
                          </TableCell>
                          <TableCell>
                            <TransactModal provider={provider} pool={pool} action={'withdraw'} />
                          </TableCell>
                          <TableCell>
                            <span style ={{display: 'flex', justifyContent: 'center'}}>
                            {(pool.share ? pool.share * 100 : 0).toFixed(2)+ '%'}
                            </span>
                            </TableCell>
                        </TableRow>
                      );
                    })
                  : null}
              </TableBody>
            </Table>
          </TableContainer>
          </div>
        )
          : null
        }
      </div>
    </>
  );
}

export default Pools;
