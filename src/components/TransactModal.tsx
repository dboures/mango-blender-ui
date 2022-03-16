import {
  Button,
  Modal,
  Box,
  Typography,
  Grid,
  FormControl,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Provider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
//   import Balance from "../../interfaces/interface.balance";
//   import { BalanceService } from "../../services/service.balance";
import { useSnackBar } from "../other/SnackbarContext";
import { buyIntoPool, redeemFromPool } from "../services/service.transact";
import { Pool } from "./Pools";

const transactStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  color: "black",
  background: "white",
  border: "2px solid #000",
};

function TransactModal(props: {
  provider: Provider;
  pool: Pool;
  action: "deposit" | "withdraw";
}) {
  const [showTransactModal, setShowTransactModal] = useState(false);
  const [transactAmount, setTransactAmount] = useState("");
  const snackBarActions = useSnackBar();

  function openTransactModal() {
    setShowTransactModal(true);
  }

  function closeTransactModal() {
    setTransactAmount("");
    setShowTransactModal(false);
  }

  async function handleBuyInto(amount: number) {
    const success = await buyIntoPool(props.provider, props.pool, +amount);
    if (success) {
      snackBarActions.showSnackBar("Successfully bought into pool", "success");
      setTransactAmount("");
    } else {
      snackBarActions.showSnackBar("Error, please try again", "error");
    }
  }

  async function handleRedeem(amount: number) {
    const success = await redeemFromPool(props.provider, props.pool, +amount);
    if (success) {
      snackBarActions.showSnackBar("Successful redemption", "success");
      setTransactAmount("");
    } else {
      snackBarActions.showSnackBar("Error, please try again", "error");
    }
  }

  return (
    <div>
      <Button onClick={openTransactModal}>
        {props.action === "deposit" ? "Buy Into Pool" : "Redeem"}
      </Button>
      <br></br>
      <Modal
        open={showTransactModal}
        onClose={closeTransactModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box style={transactStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {props.action === "deposit" ? "Buy Into Pool" : "Redeem"}
          </Typography>
          <Grid container spacing={2} style={ {marginBottom: 10}}>
            <Grid item xs={2}></Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <TextField
                  id="outlined-basic"
                  label="USDC Amount"
                  variant="outlined"
                  type="number"
                  value={transactAmount}
                  onChange={(e) => setTransactAmount(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>

          <Grid container spacing={2} style={ {marginBottom: 10, justifyContent: 'center'}}>
            <Grid item xs={3}></Grid>
            <Grid item xs={6} style = {{ display: 'flex', justifyContent: 'center', alignContent: 'center'}}>
              {props.action === "deposit" ? (
                <Button
                  disabled={+transactAmount <= 0}
                  onClick={() => {
                    handleBuyInto(+transactAmount);
                  }}
                >
                  Buy Into Pool
                </Button>
              ) : (
                <Button
                  style = {{ display: 'flex', justifyContent: 'center', alignContent: 'center'}}
                  disabled={+transactAmount <= 0} // ||  +transactAmount > predictWithdraw(providerIouTokenAmount)
                  onClick={() => {
                    handleRedeem(+transactAmount);
                  }}
                >
                  Redeem From Pool
                </Button>
              )}
            </Grid>

            <Grid item xs={3}></Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}

export default TransactModal;
