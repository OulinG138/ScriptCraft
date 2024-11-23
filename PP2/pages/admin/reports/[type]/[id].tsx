import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Paper,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";
import toast from "react-hot-toast";

interface Reporter {
  firstName: string;
  lastName: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  description: string;
  content: string;
  isHidden: boolean;
}

interface Comment {
  id: number;
  content: string;
  isHidden: boolean;
}

interface ReportDetail {
  id: number;
  explanation: string;
  targetType: "post" | "comment";
  createdAt: string;
  reporter: Reporter;
  post?: Post;
  comment?: Comment;
}

const ReportDetailPage: React.FC = () => {
  const router = useRouter();
  const { type, id } = router.query;
  const { auth } = useAuth();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isHidden, setIsHidden] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: string;
    title: string;
    message: string;
  }>({
    open: false,
    action: "",
    title: "",
    message: "",
  });

  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!id || !auth?.accessToken) return;

      setLoading(true);
      try {
        const response = await API.admin.getReportById(
          auth.accessToken,
          Number(id)
        );
        setReport(response.data);

        if (response.data.post?.isHidden || response.data.comment?.isHidden) {
          setIsHidden(true);
        }
      } catch (error) {
        console.error("Error fetching report detail:", error);
        setError("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchReportDetail();
    }
  }, [id, auth?.accessToken, router.isReady]);

  const handleAction = async (action: "resolve") => {
    if (!report || !auth?.accessToken || !type) return;

    setActionLoading(true);
    try {
      if (isHidden && !(report.post?.isHidden || report.comment?.isHidden)) {
        try {
          await API.admin.hideReportById(auth.accessToken, report.id, {
            targetType: type === "comments" ? "comment" : "post",
          });
        } catch (error) {
          console.error("Error hiding content:", error);
          toast.error("Failed to hide content. Please try again.");
          setActionLoading(false);
          return;
        }
      }

      // Then resolve the report
      await API.admin.resolveReportById(auth.accessToken, report.id);

      router.push(`/admin/reports/${type}`);
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      toast.error(`Failed to ${action} report. Please try again.`);
      setError(`Failed to ${action} report`);
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, action: "", title: "", message: "" });
    }
  };

  const toggleHideContent = () => {
    setIsHidden(!isHidden);
  };

  const openConfirmDialog = (action: "resolve") => {
    let message = "Are you sure you want to mark this report as resolved?";
    if (isHidden && !(report?.post?.isHidden || report?.comment?.isHidden)) {
      message =
        "This will hide the content and mark the report as resolved. Continue?";
    }

    setConfirmDialog({
      open: true,
      action,
      title: "Resolve Report",
      message,
    });
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Report not found</Typography>
      </Box>
    );
  }

  const isContentHidden = report.post?.isHidden || report.comment?.isHidden;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Paper
        sx={{
          maxWidth: 1200,
          mx: "auto",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <WarningAmberIcon />
          <Typography variant="h5" component="h1">
            Report #{report.id}
          </Typography>
        </Box>

        {/* Back Button */}
        <Box sx={{ p: 3, borderBottom: "1px solid #eee" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ color: "text.secondary" }}
          >
            Back to Reports
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Reporter Info */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
              Reporter Information
            </Typography>
            <Box sx={{ bgcolor: "#f8f9fa", p: 2, borderRadius: 1 }}>
              <Typography>
                {report.reporter.firstName} {report.reporter.lastName}
              </Typography>
              <Typography color="text.secondary">
                {report.reporter.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Report Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
              Report Details
            </Typography>
            <Box sx={{ bgcolor: "#f8f9fa", p: 2, borderRadius: 1 }}>
              <Typography sx={{ mb: 1 }}>
                <strong>Type:</strong>{" "}
                <Chip
                  label={report.targetType.toUpperCase()}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>Created at:</strong>{" "}
                {new Date(report.createdAt).toLocaleString()}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>Explanation:</strong>
              </Typography>
              <Typography
                sx={{
                  bgcolor: "white",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #eee",
                  color: "text.secondary",
                }}
              >
                {report.explanation}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Reported Content */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Reported Content
              {isContentHidden && (
                <Chip
                  label="Content is currently hidden from users"
                  size="small"
                  color="warning"
                />
              )}
            </Typography>
            <Box sx={{ bgcolor: "#f8f9fa", p: 2, borderRadius: 1 }}>
              {report.post && (
                <>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Post ID:</strong> {report.post.id}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Title:</strong> {report.post.title}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Description:</strong> {report.post.description}
                  </Typography>
                  <Typography>
                    <strong>Content:</strong>
                  </Typography>
                  <Typography
                    sx={{
                      bgcolor: "white",
                      p: 2,
                      mt: 1,
                      borderRadius: 1,
                      border: report.post.isHidden
                        ? "2px solid #ed6c02"
                        : "1px solid #eee",
                      color: "text.secondary",
                    }}
                  >
                    {report.post.content}
                  </Typography>
                </>
              )}
              {report.comment && (
                <>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Comment ID:</strong> {report.comment.id}
                  </Typography>
                  <Typography
                    sx={{
                      bgcolor: "white",
                      p: 2,
                      mt: 1,
                      borderRadius: 1,
                      border: report.comment.isHidden
                        ? "2px solid #ed6c02"
                        : "1px solid #eee",
                      color: "text.secondary",
                    }}
                  >
                    {report.comment.content}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            p: 3,
            bgcolor: "#f8f9fa",
            borderTop: "1px solid #eee",
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant={isHidden ? "contained" : "outlined"}
            color="warning"
            startIcon={isHidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
            onClick={toggleHideContent}
            disabled={actionLoading || isContentHidden}
          >
            {isContentHidden
              ? "Content Hidden"
              : isHidden
                ? "Show Content"
                : "Hide Content"}
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => openConfirmDialog("resolve")}
            disabled={actionLoading}
          >
            Resolve
          </Button>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleAction("resolve")}
            color="success"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportDetailPage;
