import React, { useState } from "react";
import { Snackbar, Alert } from "@mui/material";

interface AlertProps {
    message: string,
    openSnackbar: boolean,
    setOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>
}

const SnackbarAlert = ({
    message,
    openSnackbar,
    setOpenSnackbar
  }: AlertProps) => {
    return (
        <Snackbar 
        open={openSnackbar} 
        autoHideDuration={5000} 
        onClose={() => setOpenSnackbar(false)}
        >
        <Alert 
        onClose={() => setOpenSnackbar(false)} 
        severity="info" 
        sx={{ width: '100%' }}
        >
        {message}
        </Alert>
        </Snackbar>
    )}


export default SnackbarAlert;
