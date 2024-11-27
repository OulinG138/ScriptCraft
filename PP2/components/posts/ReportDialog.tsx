import React, { useState } from "react";
import { Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import API from "@/routes/API";

interface CreatePostDialogProps {
    openReportDialog: boolean,
    setOpenReportDialog: React.Dispatch<React.SetStateAction<boolean>>,
    setReportExplanation: React.Dispatch<React.SetStateAction<string>>,
    handleSubmitReport: () => void,
    reportExplanation: string
}

const ReportDialog = ({
    openReportDialog,
    setOpenReportDialog,
    setReportExplanation,
    handleSubmitReport,
    reportExplanation
}: CreatePostDialogProps) => {

  return (
    <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)}
    maxWidth="sm"
    fullWidth>
    <DialogTitle>Report</DialogTitle>
    <DialogContent>
        <TextField
            multiline
            label="Explanation"
            value={reportExplanation}
            onChange={(e) => setReportExplanation(e.target.value)}
            fullWidth
            rows={4}
            sx={{
                '& textarea': {
                overflowY: 'auto',
                }
            }}
        />
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenReportDialog(false)} color="primary">
        Cancel
        </Button>
        <Button onClick={handleSubmitReport} color="primary">
        Submit Report
        </Button>
    </DialogActions>
    </Dialog>
    );
};

export default ReportDialog;
