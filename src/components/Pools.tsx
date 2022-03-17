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
          <TableContainer component={Paper} sx={{maxWidth: 2000, margin: 'auto', backgroundColor: '#2A2440'}}>
            <Table
              sx={{ minWidth: 650 }}
              size="medium"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow style ={{color:'#2A2440'}}>
                  <TableCell style ={{color:'#fff'}}>Pool Name</TableCell>
                  <TableCell style ={{color:'#fff'}}>Pool Key</TableCell>
                  <TableCell style ={{color:'#fff'}}>Admin Key</TableCell>
                  <TableCell style ={{color:'#fff'}}>View Mango Account</TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell>
                  <span style ={{display: 'flex', justifyContent: 'center', color:'#fff'}}>
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
                          <TableCell style ={{color:'#fff'}}>{pool.poolName}</TableCell>
                          <TableCell style ={{color:'#fff'}}>{pool.key.toBase58()}</TableCell>
                          <TableCell style ={{color:'#fff'}}>{pool.admin.toBase58()}</TableCell>
                          <TableCell style ={{color:'#fff'}}>
                            {/* TODO: mainnet (when it's time) */}
                            <a
                              href={
                                "https://devnet.mango.markets/account?pubkey=" +
                                pool.mangoAccount.toBase58()
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{color:"#FF9C24"}}
                            >
                              {pool.mangoAccount.toBase58()}
                            </a>
                          </TableCell>
                          <TableCell>
                            <TransactModal provider={provider} pool={pool} action={'deposit'} refresh={refreshPools}  />
                          </TableCell>
                          <TableCell>
                            <TransactModal provider={provider} pool={pool} action={'withdraw'} refresh={refreshPools} />
                          </TableCell>
                          <TableCell style ={{color:'#fff'}}>
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
          <div style = {{ display: 'flex', justifyContent: 'center', alignContent: 'center', marginTop:10}} className="row">
            <Button onClick={refreshPools}>Refresh Pools</Button>
            </div>
          </div>
        )
          : null
        }
      </div>
    </>
  );
}

export default Pools;
