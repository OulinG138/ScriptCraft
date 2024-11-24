import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MenuItem, Select, InputLabel, FormControl, Container, Typography, Box, Chip, Pagination, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, SelectChangeEvent } from "@mui/material";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";
import RatingsButtons from "./components/RatingsButtons"
import CreatePostDialog from "./components/CreatePostDialog";

interface Rating {
    id: number,
    value: number,
    targetType: "post" | "comment",
    userId: string,
    blogPostId: number,
    commentId: number
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
  author: {firstName: string, lastName: string}
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
  author: {firstName: string, lastName: string};
}

const PostDetailPage = () => {
    const router = useRouter();
    const { auth } = useAuth();
    const [id, setId] = useState<number>(0);
    const [post, setPost] = useState<Post | null>(null);

    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState(1);
    const [commentsPerPage, setCommentsPerPage] = useState(5);
    const [sortBy, setSortBy] = useState("ratings");
    const [totalPages, setTotalPages] = useState(1);
    const [newComment, setNewComment] = useState({content: "", parentCommentId: null});
    const [newReply, setNewReply] = useState({content: "", parentCommentId: 0});
    
    const [openReportDialog, setOpenReportDialog] = useState(false);
    const [reportExplanation, setReportExplanation] = useState("");
    const [reportTarget, setReportTarget] = useState<{ type: "post" | "comment"; id: number } | null>(null);

    const [showReplies, setShowReplies] = useState<{ parentCommentId: number; replies: Comment[] }>({ parentCommentId: 0, replies: [] });
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
      codeTemplateIds: [] as number[]
    });
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);  

    const openEditPostDialog = () => {
      if (auth.user) {
        setCreatePostDialogOpen(true);
      } else {
        router.push('/login');
      }
    };
  
    const closeEditPostDialog = () => {
      setCreatePostDialogOpen(false);
      fetchPost();
    };

    const handleEditPostSubmit = async () => {
      if (!editPost.title || !editPost.description || !editPost.content) {
        setSnackbarMessage("Title, description, and content are required.");
        setOpenSnackbar(true);
        return;
      }
    
      if (!auth.accessToken) {
        console.error("Access token is missing");
        setSnackbarMessage("Error: Login again and retry");
        setOpenSnackbar(true);
        return;
      }
    
      try {
        await API.blogpost.updateBlogPost(auth.accessToken, id, editPost);
        closeEditPostDialog();
        fetchPost();
        setSnackbarMessage("Post edited successfully!");
        setOpenSnackbar(true);
      } catch (error) {
        console.error("Error editing post", error);
        setSnackbarMessage("Error: Login again and retry");
        setOpenSnackbar(true);
      }
    };

    useEffect(() => {
      const queryId = router.query.id;

      // Ensure queryId is a string
      if (typeof queryId === 'string') {
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
          const response = await API.blogpost.getBlogPost(auth.accessToken, Number(id));
          const post = response.data;
          setPost(post);          
          setEditPost({
            title: post.title,
            description: post.description,
            content: post.content,
            tags: post.tags.map((tag: { id: number; name: string }) => tag.name),
            codeTemplateLinks: post.codeTemplates.map((template: { id: number }) => `${window.location.origin}/code-template?id=${window.btoa(String(template.id))}`),
            codeTemplateIds: post.codeTemplates.map((template: { id: number }) => template.id),
          });
        } catch (error) {
          console.error("Error fetching post", error);
        }
      }
    };

    const fetchComments = async (page: number) => {
      if (post) {
        try {
          const response = await API.blogpost.getPaginatedComments(auth.accessToken, post.id, sortBy, page, commentsPerPage)
          setComments(response.data.comments);
          setTotalPages(response.data.totalPages);
        } catch (error) {
          console.error("Error fetching comments", error);
        }
      }
    };
    
    const handleCommentSubmit = async () => {
      if (!newComment.content.trim() || !post) return;
      try {
        if (!auth.accessToken) {
          return
        } else {
          await API.blogpost.postComment(auth.accessToken, post.id, newComment);
          setNewComment(prevState => ({
            ...prevState,
            content: ""
          }));
          fetchComments(page);
        }
      } catch (error) {
        console.error("Error submitting comment", error);
      }
    };

    const fetchReplies = async(commentId: number) => {
      try {
        const response = await API.blogpost.getPaginatedReplies(auth.accessToken, commentId, 1, repliesPerPage);
        setShowReplies({parentCommentId: commentId, replies: response.data.replies});
        setRepliesPage(1);
        setTotalRepliesPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching comments", error);
      }
    }

    const handleHideReplies = () => {
      setShowReplies({parentCommentId: 0, replies: []});
      setRepliesPage(1);
      setTotalRepliesPages(0);
    }

    const handleReply = (commentId: number) => {
      setNewReply(prevState => ({ ...prevState, parentCommentId: commentId }));
    };
  
    const handleReplySubmit = async (parentCommentId: number) => {
      if (!newReply.content || !post) return;
      if (!auth?.accessToken) {
        console.error("Access token is missing.");
        return;
      }
      try {
        await API.blogpost.postComment(auth.accessToken, post.id, newReply);
        setNewReply(prevState => ({
          ...prevState,
          content: "",
          parentCommentId
        }));
        fetchComments(page);
      } catch (error) {
        console.error("Error submitting reply", error);
      }
    };
    
    const handleCloseSnackbar = () => {
      setOpenSnackbar(false);
    };

    const handleCancelReply = () => {
      setNewReply(prevState => ({
        ...prevState,
        content: "",
        parentCommentId: 0
      }));
    };
  
    useEffect(() => {
      fetchPost();
      fetchComments(page);
    }, [id]);
  
    useEffect(() => {
      fetchComments(page);
    }, [post, page, sortBy, commentsPerPage]);

    const handleReport = (targetType: "post" | "comment", targetId: number) => {
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
        })
        setOpenReportDialog(false);
        setReportExplanation("");
      } catch (error) {
        console.error("Error submitting report", error);
      }
    };

    const handleVote = async (targetType: "post" | "comment", target: Post | Comment, value: number) => {
      try {
        if (!auth.accessToken) {
          return
        }

        if (!target.userRating) {
          await API.blogpost.postRating(auth.accessToken, {targetType, targetId: target.id, value})
        } else if (target.userRating.value === value) {
          await API.blogpost.deleteRating(auth.accessToken, target.userRating.id)
          setPost(prevPost => {
            const { userRating, ...rest } = prevPost as Post;
            return rest;
          });
        } else if (target.userRating.value !== value) {
          await API.blogpost.deleteRating(auth.accessToken, target.userRating.id)
          await API.blogpost.postRating(auth.accessToken, {targetType, targetId: target.id, value});
        }
        fetchPost();
        fetchComments(page);
      } catch(error) {
        console.error("Error posting rating", error);
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

    const handleEditPostChange = (field: string, value: string | string[] | number[]) => {
      setEditPost((prev) => ({ ...prev, [field]: value }));
    };

    const handleMoreReplies = async() => {
      try {
        const parentCommentId = showReplies.parentCommentId;
        const response = await API.blogpost.getPaginatedReplies(auth.accessToken, parentCommentId, repliesPage + 1, repliesPerPage);
        setShowReplies((prevState) => ({
          ...prevState,
          replies: prevState.replies.concat(response.data.replies),
        }));      
        setRepliesPage(repliesPage + 1)  
        setTotalRepliesPages(response.data.totalRepliesPages);
      } catch (error) {
        console.error("Error fetching comments", error);
      }
    }
  
    if (!post) return <div>Loading...</div>;
    
    return (
      <Container sx={{ pt: 3, pb: 3 }}>
        <Box sx={{ padding: 3, border: "1px solid #ddd", borderRadius: 2 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>

          <div style={{ flex: 1 }}>

            <Typography variant="h4" sx={{ mb: 2, fontSize: '2rem' }}>
              {post.title}
            </Typography>

            <Typography variant="body1" color="textSecondary" >
            By {`${post.author.firstName} ${post.author.lastName} ${post.authorId.slice(-5)}`} | Posted: {new Date(post.createdAt).toLocaleDateString()}  | Last Updated: {new Date(post.updatedAt).toLocaleDateString()}
            </Typography>

            <RatingsButtons userId={auth.user?.id || null} targetType='post' element={post} onReport={handleReport} onVote={handleVote} openEditPostDialog={openEditPostDialog} ></RatingsButtons>
    
            <Typography variant="body1"   sx={{mb: 3, whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
              {post.content}
            </Typography>

            <Box sx={{ mt: 3 }}>
            <Typography variant="body1" sx={{ display: "inline", mr: 1 }}>
              Tags:
            </Typography>
            <Box sx={{ display: "inline-flex", flexWrap: "wrap", gap: 1 }}>
              {post.tags.map((tag) => (
                <Chip key={tag.id} label={tag.name} />
              ))}
            </Box>
            </Box>

            {/* Code Templates */}
            <Box sx={{ mt: 3 }}>
              {post.codeTemplates.length > 0 && (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Code Templates:
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {editPost.codeTemplateLinks.map((link) => (
                      <Link href={link} passHref>
                        <Typography
                          variant="body2"
                          sx={{ color: "primary.main", textDecoration: "underline" }}
                        >
                          {link}
                        </Typography>
                      </Link>
                    ))}
                  </Box>
                </>
              )}
            </Box>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Comments:
            </Typography>

            {/* Comment Box*/}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={newComment.content}
                onChange={(e) => setNewComment(prevState => ({
                  ...prevState,
                  content: e.target.value
                }))}
                placeholder="Write your comment..."
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleCommentSubmit}
                disabled={!newComment.content.trim()}
              >
                Comment
              </Button>
            </Box>

          {/* Display Comments */}
          <Box sx={{ mt: 3 }}>
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

        <FormControl sx={{ marginRight: 2, width: '150px' }}>
        <InputLabel>Posts Per Page</InputLabel>
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

            {comments.length > 0 ? (
              <List>
                {comments.map((comment) => (
                  <ListItem key={comment.id} className="flex -space-y-2 flex-col items-start w-full"     sx={{
                    borderTop: comment.id === comments[0].id ? 'none' : '1px solid #e0e0e0'
                }}>
                  
                  {/* Comment Content */}
                  <Box className="box w-full">
                      <ListItemText
                        primary={comment.content}
                      />
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      By {`${comment.author.firstName} ${comment.author.lastName} ${comment.authorId.slice(-5)}`} | Posted: {new Date(comment.createdAt).toLocaleDateString()}  | Last Updated: {new Date(comment.updatedAt).toLocaleDateString()}
                      </Typography>
                  </Box>

                  {/* Reply Buttons */}
                  <Box className="box w-full" sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Button
                      color="primary"
                      size="small"
                      className={`w-8'}`} 
                      sx={{ minWidth: 'auto' }}
                      onClick={() => handleReply(comment.id)}
                    >Reply</Button>

                    { comment.repliesCount > 0 &&
                    (showReplies.parentCommentId !== comment.id ? (
                      <>
                      <Button
                      color="primary"
                      size="small"
                      onClick={() => fetchReplies(comment.id)}
                      >Show Replies</Button></>):
                      (<>
                      <Button
                        color="primary"
                        size="small"
                        onClick={handleHideReplies}
                      >Hide Replies</Button>
                      </>))
                    } 
                    <RatingsButtons userId={auth.user?.id || null} targetType='comment' element={comment} onReport={handleReport} onVote={handleVote} openEditPostDialog={openEditPostDialog} ></RatingsButtons>
                  </Box>

                  {/* Reply Box */}
                  {newReply.parentCommentId === comment.id && (
                  <Container style={{ marginTop: '5px' }}>
                    <TextField
                      label="Write your reply"
                      multiline
                      rows={4}
                      value={newReply.content}
                      onChange={(e) => setNewReply(prevState => ({ ...prevState, content: e.target.value }))}
                      fullWidth
                    />
                    <Button
                      color="primary"
                      onClick={async () => {
                        await handleReplySubmit(comment.id);
                      }}
                    >
                      Submit
                    </Button>
                    <Button
                      color="primary"
                      onClick={handleCancelReply}
                    >
                      Cancel
                    </Button>
                  </Container>
                  )}

                  {/* Replies */}
                  {showReplies.parentCommentId === comment.id && (
                    showReplies.replies.length > 0 ? (
                      <Container style={{ marginTop: '5px' }}>
                        {showReplies.replies.map((reply) => (
                          <ListItem key={reply.id} className="flex -space-y-2 flex-col items-start w-full" sx={{borderTop: '1px solid #e0e0e0'}}>
                            <Box className="box w-full">
                                <ListItemText
                                  primary={reply.content}
                                />
                                <Typography variant="body2" color="textSecondary">
                                By {`${reply.author.firstName} ${reply.author.lastName} ${reply.authorId.slice(-5)}`} | Posted: {new Date(reply.createdAt).toLocaleDateString()}  | Last Updated: {new Date(reply.updatedAt).toLocaleDateString()}
                                </Typography>
                                <RatingsButtons userId={auth.user?.id || null} targetType='comment' element={comment} onReport={handleReport} onVote={handleVote} openEditPostDialog={openEditPostDialog}></RatingsButtons>
                            </Box>
                          </ListItem>
                        ))}
                        {repliesPage < totalRepliesPages &&
                        (<Button
                        color="primary"
                        size="small"
                        onClick={() => handleMoreReplies()}
                        >
                          More Replies
                        </Button>)}
                      </Container>
                    ) : (
                      <Typography variant="body2" color="textSecondary" style={{ marginTop: '5px' }}>
                        No replies
                      </Typography>
                    )
                  )}
                </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" textAlign="center" mt={3}>
                No comments to display
              </Typography>
            )}
          </Box>

          {/* Comment Pagination */}
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
          </Box>)}
          </div>
        </div>
        </Box>

      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)}
          maxWidth="sm"
          fullWidth>
        <DialogTitle>Report</DialogTitle>
        <DialogContent>
          <TextField
            label="Explanation"
            value={reportExplanation}
            onChange={(e) => setReportExplanation(e.target.value)}
            fullWidth
            multiline
            rows={4}
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

      {createPostDialogOpen && <CreatePostDialog 
        dialogType="edit"
        open={createPostDialogOpen}
        post={editPost}
        onClose={closeEditPostDialog}
        onChange={handleEditPostChange}
        onSubmit={handleEditPostSubmit}
        openSnackbar={openSnackbar}
        onCloseSnackbar={handleCloseSnackbar}
        message={snackbarMessage}
      >
      </CreatePostDialog>}
      </Container>
  )
};

export default PostDetailPage;