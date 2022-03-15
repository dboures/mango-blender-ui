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

export interface Pool {
  key: PublicKey;
  poolName: string;
  poolBump: number;
  iouMintBump: number;
  iouMint: PublicKey;
  admin: PublicKey;
}

function Pools() {
  const connection = useConnection().connection;
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet() as AnchorWallet;
  const provider = new Provider(connection, anchorWallet, {});

  // useState here
  const [pools, setPools] = React.useState<Pool[]>([]);

  const refreshPools = () => {
    fetchPools(provider).then((pools: Pool[]) => {
      setPools(pools);
    });
  };

  useEffect(() => {
    // refreshTrader();
    refreshPools();
  }, [wallet?.connected]);

  return (
    <>
      <div className="row">
        <h2>Pool Here</h2>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Pool Name</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>View Mango Account</TableCell>
                <TableCell>Buy Into/Redeem From Pool</TableCell>
                {/* <TableCell>Current Value</TableCell>
                  <TableCell>Ownership Share</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {pools.length > 0
                ? pools.map((pool: Pool) => {
                    return (
                      <TableRow key={pool.key.toString()}>
                        <TableCell>{pool.poolName}</TableCell>
                        <TableCell>{pool.admin.toBase58()}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => console.log("devs do something")}
                          >
                            View Mango Account
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => console.log("devs do something")}
                          >
                            GOTO buy/withdraw
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                : null}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}

export default Pools;
