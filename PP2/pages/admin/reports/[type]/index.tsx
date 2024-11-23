import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Paper,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { useRouter } from "next/router";
import API from "@/routes/API";
import useAuth from "@/hooks/useAuth";

interface Report {
  reportId: number;
  reporter: {
    firstName: string;
    lastName: string;
    email: string;
  };
  relatedPostId?: number;
  relatedCommentId?: number;
}

interface QueryParams {
  type?: string;
  page?: string;
  limit?: string;
  sort?: string;
}

const AdminReportsPage: React.FC = () => {
  const router = useRouter();
  const {
    type,
    page: pageParam,
    limit: limitParam,
    sort: sortParam,
  } = router.query as QueryParams;
  const { auth } = useAuth();
  const accessToken = auth?.accessToken || "";

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<string>(
    (sortParam as string) || ""
  );
  const [page, setPage] = useState<number>(parseInt(pageParam as string) || 1);
  const [limit, setLimit] = useState<number>(
    parseInt(limitParam as string) || 5
  );
  const [totalReports, setTotalReports] = useState<number>(0);

  const isComments = type === "comments";
  const isPosts = type === "posts";

  const updateURL = (newParams: {
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const currentQuery = { ...router.query };
    const updatedQuery = {
      ...currentQuery,
      ...newParams,
    };

    Object.keys(updatedQuery).forEach((key) => {
      const typedKey = key as keyof typeof updatedQuery;
      if (
        updatedQuery[typedKey] === undefined ||
        updatedQuery[typedKey] === ""
      ) {
        delete updatedQuery[typedKey];
      }
    });

    router.push(
      {
        pathname: router.pathname,
        query: updatedQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  useEffect(() => {
    if (router.isReady && !type) {
      router.replace({
        pathname: "/admin/reports/comments",
        query: {
          page: pageParam,
          limit: limitParam,
          sort: sortParam,
        },
      });
    }
  }, [type, router, router.isReady]);

  useEffect(() => {
    if (router.isReady) {
      const newPage = parseInt(pageParam as string) || 1;
      const newLimit = parseInt(limitParam as string) || 5;
      const newSort = (sortParam as string) || "";

      setPage(newPage);
      setLimit(newLimit);
      setSortOrder(newSort);
    }
  }, [router.isReady, pageParam, limitParam, sortParam]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiFunction = isComments
        ? API.admin.getReportedComments
        : API.admin.getReportedPosts;

      const response = await apiFunction(accessToken, sortOrder, page, limit);
      setReports(response.data.reports || []);
      setTotalReports(response.data.totalReports);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type) fetchData();
  }, [type, sortOrder, page, limit]);

  const handleTabChange = (newType: "comments" | "posts") => {
    router.push({
      pathname: `/admin/reports/${newType}`,
      query: {
        page,
        limit,
        sort: sortOrder,
      },
    });
  };

  const handleSortChange = (newSort: string) => {
    setSortOrder(newSort);
    setPage(1);
    updateURL({ sort: newSort, page: 1 });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updateURL({ limit: newLimit, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({ page: newPage });
  };

  const handleReportClick = (reportId: number) => {
    router.push(`/admin/reports/${type}/${reportId}`);
  };

  const totalPages = Math.ceil(totalReports / limit);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f9f9f9", padding: 4 }}>
      <Paper sx={{ borderRadius: 2, maxWidth: 1200, mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            px: 3,
            py: 1,
          }}
        >
          <Box sx={{ display: "flex" }}>
            <Box
              onClick={() => handleTabChange("comments")}
              sx={{
                px: 3,
                py: 2,
                cursor: "pointer",
                borderBottom: isComments ? 2 : 0,
                borderColor: "primary.main",
                color: isComments ? "primary.main" : "inherit",
              }}
            >
              REPORTED COMMENTS
            </Box>
            <Box
              onClick={() => handleTabChange("posts")}
              sx={{
                px: 3,
                py: 2,
                cursor: "pointer",
                borderBottom: isPosts ? 2 : 0,
                borderColor: "primary.main",
                color: isPosts ? "primary.main" : "inherit",
              }}
            >
              REPORTED POSTS
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 6 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Sort By Report Count
              </Typography>
              <Select
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
                displayEmpty
                size="small"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Items per page
              </Typography>
              <Select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                size="small"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <CircularProgress />
          ) : reports.length === 0 ? (
            <Typography>No reports found.</Typography>
          ) : (
            reports.map((report) => (
              <Box
                key={report.reportId}
                onClick={() => handleReportClick(report.reportId)}
                sx={{
                  mb: 2,
                  p: 3,
                  border: "1px solid #eee",
                  borderRadius: 1,
                  "&:hover": { boxShadow: 1 },
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Report ID: {report.reportId}
                </Typography>
                <Typography>
                  Related {isComments ? "Comment ID" : "Post ID"}:{" "}
                  {isComments ? report.relatedCommentId : report.relatedPostId}
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  Reporter: {report.reporter.firstName}{" "}
                  {report.reporter.lastName} ({report.reporter.email})
                </Typography>
              </Box>
            ))
          )}
        </Box>

        {totalReports > limit && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 3,
              pb: 3,
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => handlePageChange(value)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminReportsPage;
