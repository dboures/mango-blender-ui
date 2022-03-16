import {
    WalletContext,
    WalletProvider,
    useConnection,
    useWallet,
  } from "@solana/wallet-adapter-react";
  import { useState, useEffect, useContext } from "react";
  import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton,
  } from "@solana/wallet-adapter-react-ui";
  import {
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Avatar,
    Container,
    Menu,
    MenuItem,
    Tooltip,
  } from "@mui/material";
  import { Link } from "react-router-dom";
  
  require("@solana/wallet-adapter-react-ui/styles.css");
  
  function Header() {
    const wallet = useWallet();
  
    // const pages = ["Home", "Orders"];
    // const links = ["/", "/orders"];
  
    return (
      <WalletModalProvider>
        <AppBar position="static">
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
              >
                Mango Blender (Devnet)
              </Typography>
              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                {wallet.connected ? (
                    wallet.publicKey?.toBase58()
                ) 
                : (
                  null
                )}
              </Box>
              <Box sx={{ flexGrow: 0 }}>
                {wallet.connected ? (
                  <WalletDisconnectButton />
                ) : (
                  <WalletMultiButton />
                )}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </WalletModalProvider>
    );
  }
  
  export default Header;
  