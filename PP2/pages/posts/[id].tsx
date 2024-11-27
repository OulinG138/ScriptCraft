import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import {
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Container,
  Typography,
  Box,
  Chip,
  Pagination,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";
import RatingsButtons from "@/components/posts/RatingsButtons";
import CreatePostDialog from "@/components/posts/CreatePostDialog";
import ReportDialog from "@/components/posts/ReportDialog";
import DeleteDialog from "@/components/posts/DeleteDialog";
import FlagIcon from "@mui/icons-material/Flag";

interface Rating {
  id: number;
  value: number;
  targetType: "post" | "comment";
  userId: string;
  blogPostId: number;
  commentId: number;
}

interface Post {
  id: number;
  title: string;
  description: string;
  content: string;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  ratingCount: number;
  reportCount: number;
  authorId: string;
  codeTemplates: { id: number; title: string }[];
  tags: { id: number; name: string }[];
  userRating?: Rating;
  author: { firstName: string; lastName: string };
}

interface Comment {
  id: number;
  content: string;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
  ratingCount: number;
  reportCount: number;
  parentCommentId: number | null;
  authorId: string;
  postId: number;
  replies: Comment[];
  repliesCount: number;
  userRating?: Rating;
  author: { firstName: string; lastName: string };
}

const PostDetailPage = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const [id, setId] = useState<number>(0);
  const [post, setPost] = useState<Post | null>(null);

  const [isVoting, setIsVoting] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [commentsPerPage, setCommentsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState("date");
  const [totalPages, setTotalPages] = useState(1);
  const [newComment, setNewComment] = useState({
    content: "",
    parentCommentId: null,
  });
  const [newReply, setNewReply] = useState({ content: "", parentCommentId: 0 });

  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportExplanation, setReportExplanation] = useState("");
  const [reportTarget, setReportTarget] = useState<{
    type: "post" | "comment";
    id: number;
  } | null>(null);

  const [showReplies, setShowReplies] = useState<{
    parentCommentId: number;
    replies: Comment[];
  }>({ parentCommentId: 0, replies: [] });
  const [repliesPage, setRepliesPage] = useState(1);
  const repliesPerPage = 5;
  const [totalRepliesPages, setTotalRepliesPages] = useState(0);

  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [editPost, setEditPost] = useState({
    title: "",
    description: "",
    content: "",
    tags: [] as string[],
    codeTemplateLinks: [] as string[],
    codeTemplateIds: [] as number[],
  });

  const openEditPostDialog = () => {
    setCreatePostDialogOpen(true);
  };

  const closeEditPostDialog = () => {
    setCreatePostDialogOpen(false);
    fetchPost();
  };

  const handleEditPostSubmit = async () => {
    if (!editPost.title || !editPost.description || !editPost.content) {
      toast.error("Title, description, and content are required.");
      return;
    }

    if (!auth.accessToken) {
      console.error("Access token is missing");
      toast.error("Error: Login again and retry");
      return;
    }

    try {
      await API.blogpost.updateBlogPost(auth.accessToken, id, editPost);
      closeEditPostDialog();
      fetchPost();
      toast.success("Post edited successfully!");
    } catch (error) {
      console.error("Error editing post", error);
      toast.error("Error: Login again and retry");
    }
  };

  useEffect(() => {
    const queryId = router.query.id;

    // Ensure queryId is a string
    if (typeof queryId === "string") {
      try {
        const decodedString = window.atob(queryId);
        const id = Number(decodedString);
        setId(id);
      } catch (error) {
        console.error("Error decoding post ID:", error);
      }
    } else {
      console.warn("Query ID is not a string:", queryId);
    }
  }, [router.query]);

  const fetchPost = async () => {
    if (id) {
      try {
        setIsLoading(true);
        const response = await API.blogpost.getBlogPost(
          auth.accessToken,
          Number(id)
        );
        const post = response.data;
        setPost(post);
        setEditPost({
          title: post.title,
          description: post.description,
          content: post.content,
          tags: post.tags.map((tag: { id: number; name: string }) => tag.name),
          codeTemplateLinks: post.codeTemplates.map(
            (template: { id: number }) =>
              `${window.location.origin}/code-template?id=${window.btoa(String(template.id))}`
          ),
          codeTemplateIds: post.codeTemplates.map(
            (template: { id: number }) => template.id
          ),
        });
      } catch (error) {
        console.error("Error fetching post", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchComments = async (page: number) => {
    if (post) {
      try {
        const response = await API.blogpost.getPaginatedComments(
          auth.accessToken,
          post.id,
          sortBy,
          page,
          commentsPerPage
        );
        setComments(response.data.comments);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching comments", error);
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (!auth.user) {
      toast.error("Must login to comment");
    }
    if (!newComment.content.trim() || !post) return;
    try {
      if (!auth.accessToken) {
        return;
      } else {
        await API.blogpost.postComment(auth.accessToken, post.id, newComment);
        setNewComment((prevState) => ({
          ...prevState,
          content: "",
        }));
        fetchComments(page);
      }
    } catch (error) {
      console.error("Error submitting comment", error);
    }
  };

  const fetchReplies = async (commentId: number) => {
    try {
      const response = await API.blogpost.getPaginatedReplies(
        auth.accessToken,
        commentId,
        1,
        repliesPerPage
      );
      setShowReplies({
        parentCommentId: commentId,
        replies: response.data.replies,
      });
      setRepliesPage(1);
      setTotalRepliesPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  const handleHideReplies = () => {
    setShowReplies({ parentCommentId: 0, replies: [] });
    setRepliesPage(1);
    setTotalRepliesPages(0);
  };

  const handleReply = (commentId: number) => {
    if (auth.user) {
      setNewReply((prevState) => ({
        ...prevState,
        parentCommentId: commentId,
      }));
    } else {
      toast.error("Must login to reply to a comment");
    }
  };

  const handleReplySubmit = async (parentCommentId: number) => {
    if (!newReply.content || !post) return;
    if (!auth?.accessToken) {
      console.error("Access token is missing.");
      return;
    }
    try {
      await API.blogpost.postComment(auth.accessToken, post.id, newReply);
      setNewReply((prevState) => ({
        ...prevState,
        content: "",
        parentCommentId: 0,
      }));
      fetchComments(page);
      fetchReplies(parentCommentId);
    } catch (error) {
      console.error("Error submitting reply", error);
    }
  };

  const handleCancelReply = () => {
    setNewReply((prevState) => ({
      ...prevState,
      content: "",
      parentCommentId: 0,
    }));
  };

  useEffect(() => {
    fetchPost();
    fetchComments(page);
  }, [id, auth]);

  useEffect(() => {
    fetchComments(page);
  }, [post, page, sortBy, commentsPerPage]);

  const handleReport = (targetType: "post" | "comment", targetId: number) => {
    if (!auth.user) {
      toast.error("Must login to report");
      return;
    }
    setReportTarget({ type: targetType, id: targetId });
    setOpenReportDialog(true);
  };

  const handleSubmitReport = async () => {
    if (!auth.accessToken || !reportExplanation.trim() || !reportTarget) return;
    try {
      await API.blogpost.postReport(auth.accessToken, {
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        explanation: reportExplanation,
      });
      setOpenReportDialog(false);
      setReportExplanation("");
    } catch (error) {
      console.error("Error submitting report", error);
    }
  };

  const handleVote = async (
    targetType: "post" | "comment",
    target: Post | Comment,
    value: number
  ) => {
    if (!auth.user) {
      toast.error("Must login to vote");
      return;
    }
    try {
      if (!auth.accessToken) {
        return;
      }
      if (!target.userRating) {
        setIsVoting(true);
        await API.blogpost.postRating(auth.accessToken, {
          targetType,
          targetId: target.id,
          value,
        });
      } else if (target.userRating.value === value) {
        setIsVoting(true);
        await API.blogpost.deleteRating(auth.accessToken, target.userRating.id);
        setPost((prevPost) => {
          const { userRating, ...rest } = prevPost as Post;
          return rest;
        });
      } else if (target.userRating.value !== value) {
        setIsVoting(true);
        await API.blogpost.deleteRating(auth.accessToken, target.userRating.id);
        await API.blogpost.postRating(auth.accessToken, {
          targetType,
          targetId: target.id,
          value,
        });
      }
    } catch (error) {
      console.error("Error posting rating", error);
    } finally {
      fetchPost();
      fetchComments(page);
      fetchReplies(showReplies.parentCommentId);
      setIsVoting(false);
    }
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const onCommentsPerPageChange = (event: SelectChangeEvent<number>) => {
    setCommentsPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleEditPostChange = (
    field: string,
    value: string | string[] | number[]
  ) => {
    setEditPost((prev) => ({ ...prev, [field]: value }));
  };

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Post | Comment | null>(null);
  const [deleteTargetType, setDeleteTargetType] = useState<"post" | "comment">(
    "post"
  );

  const handleDelete = async (
    targetType: "post" | "comment",
    target: Post | Comment
  ) => {
    setOpenDeleteDialog(true);
    setDeleteTarget(target);
    setDeleteTargetType(targetType);
  };

  const handleMoreReplies = async () => {
    try {
      const parentCommentId = showReplies.parentCommentId;
      const response = await API.blogpost.getPaginatedReplies(
        auth.accessToken,
        parentCommentId,
        repliesPage + 1,
        repliesPerPage
      );
      setShowReplies((prevState) => ({
        ...prevState,
        replies: prevState.replies.concat(response.data.replies),
      }));
      setRepliesPage(repliesPage + 1);
      setTotalRepliesPages(response.data.totalRepliesPages);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  if (!isLoading && !post) router.push("/404");
  else if (!post) return <CircularProgress />;
  else
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          margin: "0 auto",
          p: 2,
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ mt: 1, ml: 2 }}>
          <Button
            variant="contained"
            sx={{ justifyContent: "flex-end" }}
            onClick={() => router.back()}
          >
            Back
          </Button>
        </Box>
        <Container sx={{ m: 0 }}>
          <Box
            sx={{
              padding: 5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "16px",
              bgcolor: "background.paper",
            }}
          >
            <div style={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ mb: 2, fontSize: "2rem", color: "rgba(0, 0, 0, 0.87)" }}
                >
                  {post.title}
                </Typography>
                {post.isHidden && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "error.main",
                    }}
                  >
                    <FlagIcon sx={{ fontSize: "2rem", mr: 1 }} />
                    <Typography variant="h6">HIDDEN</Typography>
                  </Box>
                )}
              </Box>

              <Typography
                variant="body1"
                sx={{ color: "rgba(0, 0, 0, 0.87)", mb: 1 }}
              >
                By{" "}
                {`${post.author.firstName} ${post.author.lastName} ${post.authorId.slice(-5)}`}{" "}
                | Posted: {new Date(post.createdAt).toLocaleDateString()} | Last
                Updated: {new Date(post.updatedAt).toLocaleDateString()}
              </Typography>

              <RatingsButtons
                isVoting={isVoting}
                userId={auth.user?.id || null}
                targetType="post"
                element={post}
                onReport={handleReport}
                onVote={handleVote}
                openEditPostDialog={openEditPostDialog}
                onDelete={handleDelete}
              />

              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  color: "rgba(0, 0, 0, 0.87)",
                }}
              >
                {post.content}
              </Typography>

              {post.tags.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "inline",
                      mr: 1,
                      fontWeight: "500",
                      color: "rgba(0, 0, 0, 0.87)",
                    }}
                  >
                    Tags:
                  </Typography>
                  <Box
                    sx={{ display: "inline-flex", flexWrap: "wrap", gap: 1 }}
                  >
                    {post.tags.map((tag) => (
                      <Chip key={tag.id} label={tag.name} />
                    ))}
                  </Box>
                </Box>
              )}

              {post.codeTemplates.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 1,
                      fontWeight: "500",
                      color: "rgba(0, 0, 0, 0.87)",
                    }}
                  >
                    Code Templates:
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {editPost.codeTemplateLinks.map((link) => (
                      <Link href={link} passHref>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "primary.main",
                            textDecoration: "underline",
                          }}
                        >
                          {link}
                        </Typography>
                      </Link>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "rgba(0, 0, 0, 0.87)" }}
                >
                  Comments:
                </Typography>
                <FormControl sx={{ marginRight: 2 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    label="Sort By"
                    size="small"
                  >
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="ratings">Ratings</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ marginRight: 2, width: "150px" }}>
                  <InputLabel>Comments Per Page</InputLabel>
                  <Select
                    value={commentsPerPage}
                    onChange={onCommentsPerPageChange}
                    label="Posts Per Page"
                    size="small"
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: "flex", mt: 3, gap: 2 }}>
                  <TextField
                    fullWidth
                    value={newComment.content}
                    onChange={(e) =>
                      setNewComment((prevState) => ({
                        ...prevState,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Write your comment..."
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCommentSubmit}
                    disabled={!newComment.content.trim()}
                    sx={{ height: "auto" }}
                  >
                    Comment
                  </Button>
                </Box>

                {comments.length > 0 ? (
                  <List
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {comments.map((comment) => (
                      <ListItem
                        key={comment.id}
                        sx={{
                          borderTop: (theme) =>
                            comment.id === comments[0].id
                              ? "none"
                              : `1px solid ${theme.palette.divider}`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography sx={{ color: "rgba(0, 0, 0, 0.87)" }}>
                                {comment.content}
                              </Typography>
                            }
                          />
                          {comment.isHidden && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                color: "error.main",
                              }}
                            >
                              <FlagIcon sx={{ fontSize: "1.5rem", mr: 1 }} />
                              <Typography variant="body1">HIDDEN</Typography>
                            </Box>
                          )}
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(0, 0, 0, 0.87)" }}
                        >
                          By{" "}
                          {`${comment.author.firstName} ${comment.author.lastName} ${comment.authorId.slice(-5)}`}{" "}
                          | Posted:{" "}
                          {new Date(comment.createdAt).toLocaleDateString()} |
                          Last Updated:{" "}
                          {new Date(comment.updatedAt).toLocaleDateString()}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            color="primary"
                            size="small"
                            sx={{ minWidth: "auto" }}
                            onClick={() => handleReply(comment.id)}
                          >
                            Reply
                          </Button>

                          {comment.repliesCount > 0 &&
                            (showReplies.parentCommentId !== comment.id ? (
                              <Button
                                color="primary"
                                size="small"
                                onClick={() => fetchReplies(comment.id)}
                              >
                                Show Replies
                              </Button>
                            ) : (
                              <Button
                                color="primary"
                                size="small"
                                onClick={handleHideReplies}
                              >
                                Hide Replies
                              </Button>
                            ))}
                          <RatingsButtons
                            isVoting={isVoting}
                            userId={auth.user?.id || null}
                            targetType="comment"
                            element={comment}
                            onReport={handleReport}
                            onVote={handleVote}
                            openEditPostDialog={openEditPostDialog}
                            onDelete={handleDelete}
                          />
                        </Box>

                        {newReply.parentCommentId === comment.id && (
                          <Container>
                            <TextField
                              label="Write your reply"
                              rows={4}
                              value={newReply.content}
                              onChange={(e) =>
                                setNewReply((prevState) => ({
                                  ...prevState,
                                  content: e.target.value,
                                }))
                              }
                              fullWidth
                            />
                            <Button
                              color="primary"
                              onClick={() => handleReplySubmit(comment.id)}
                            >
                              Submit
                            </Button>
                            <Button color="primary" onClick={handleCancelReply}>
                              Cancel
                            </Button>
                          </Container>
                        )}

                        {showReplies.parentCommentId === comment.id && (
                          <Container>
                            {showReplies.replies.map((reply) => (
                              <ListItem
                                key={reply.id}
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  width: "100%",
                                  borderTop: (theme) =>
                                    `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                <Box sx={{ width: "100%" }}>
                                  <Box
                                    sx={{
                                      width: "100%",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <ListItemText
                                      primary={
                                        <Typography
                                          sx={{ color: "rgba(0, 0, 0, 0.87)" }}
                                        >
                                          {reply.content}
                                        </Typography>
                                      }
                                    />
                                    {reply.isHidden && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          color: "error.main",
                                        }}
                                      >
                                        <FlagIcon
                                          sx={{ fontSize: "1.5rem", mr: 1 }}
                                        />
                                        <Typography variant="body1">
                                          HIDDEN
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "rgba(0, 0, 0, 0.87)" }}
                                  >
                                    By{" "}
                                    {`${reply.author.firstName} ${reply.author.lastName} ${reply.authorId.slice(-5)}`}{" "}
                                    | Posted:{" "}
                                    {new Date(
                                      reply.createdAt
                                    ).toLocaleDateString()}{" "}
                                    | Last Updated:{" "}
                                    {new Date(
                                      reply.updatedAt
                                    ).toLocaleDateString()}
                                  </Typography>
                                  <RatingsButtons
                                    isVoting={isVoting}
                                    userId={auth.user?.id || null}
                                    targetType="comment"
                                    element={reply}
                                    onReport={handleReport}
                                    onVote={handleVote}
                                    openEditPostDialog={openEditPostDialog}
                                    onDelete={handleDelete}
                                  />
                                </Box>
                              </ListItem>
                            ))}
                            {repliesPage < totalRepliesPages && (
                              <Button
                                color="primary"
                                size="small"
                                onClick={handleMoreReplies}
                              >
                                More Replies
                              </Button>
                            )}
                          </Container>
                        )}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: "center",
                      mt: 3,
                      color: "rgba(0, 0, 0, 0.87)",
                    }}
                  >
                    No comments to display
                  </Typography>
                )}
              </Box>

              {comments.length > 0 && (
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Box>
              )}
            </div>
          </Box>

          <ReportDialog
            openReportDialog={openReportDialog}
            setOpenReportDialog={setOpenReportDialog}
            setReportExplanation={setReportExplanation}
            handleSubmitReport={handleSubmitReport}
            reportExplanation={reportExplanation}
          />

          {openDeleteDialog && (
            <DeleteDialog
              auth={auth}
              openDeleteDialog={openDeleteDialog}
              setOpenDeleteDialog={setOpenDeleteDialog}
              targetType={deleteTargetType}
              target={deleteTarget as Post | Comment}
            />
          )}

          {createPostDialogOpen && (
            <CreatePostDialog
              dialogType="edit"
              open={createPostDialogOpen}
              isHidden={post.isHidden}
              post={editPost}
              onClose={closeEditPostDialog}
              onChange={handleEditPostChange}
              onSubmit={handleEditPostSubmit}
            />
          )}
        </Container>
      </Box>
    );
};

export default PostDetailPage;
