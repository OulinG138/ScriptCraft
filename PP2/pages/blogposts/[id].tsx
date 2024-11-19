import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Container, Typography, Box, Chip, Pagination, TextField, Button } from "@mui/material";
import axios from "axios";
import Link from "next/link";

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
  authorId: number;
  codeTemplates: { id: number; title: string }[];
  tags: { id: number; name: string }[];
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
  authorId: number;
  postId: number;
  replies: Comment[];
}

const PostDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [commentContent, setCommentContent] = useState("");
    const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
  
    const fetchPost = async () => {
      if (id) {
        try {
          const response = await axios.get(`/api/posts/${id}`);
          setPost(response.data);
        } catch (error) {
          console.error("Error fetching post", error);
        }
      }
    };
  
    const fetchComments = async (page: number) => {
      if (id) {
        try {
          const response = await axios.get(`/api/posts/${id}/comments`, {
            params: { page, sortBy: "ratings", limit: 5 },
          });
          setComments(response.data.comments);
          setTotalPages(response.data.totalPages);
        } catch (error) {
          console.error("Error fetching comments", error);
        }
      }
    };
  
    const buildCommentTree = (comments: Comment[]) => {
      const commentMap: { [key: number]: Comment & { replies: Comment[] } } = {};
      const roots: (Comment & { replies: Comment[] })[] = [];
  
      comments.forEach((comment) => {
        commentMap[comment.id] = { ...comment, replies: [] };
      });
  
      comments.forEach((comment) => {
        if (comment.parentCommentId) {
          commentMap[comment.parentCommentId]?.replies.push(commentMap[comment.id]);
        } else {
          roots.push(commentMap[comment.id]);
        }
      });
  
      return roots;
    };
  
    const handleCommentSubmit = async () => {
      if (!commentContent.trim()) return;
      try {
        await axios.post(`/api/posts/${id}/comments`, { commentContent });
        setCommentContent("");
        fetchComments(page);
      } catch (error) {
        console.error("Error submitting comment", error);
      }
    };
  
    const handleReplySubmit = async (parentId: number) => {
      const replyText = replyContent[parentId]?.trim();
      if (!replyText) return;
      try {
        await axios.post(`/api/posts/${id}/comments`, { commentContent: replyText, parentCommentId: parentId });
        setReplyContent({ ...replyContent, [parentId]: "" });  // Reset the reply content
        setReplyingTo(null);  // Close the reply form
        fetchComments(page);
      } catch (error) {
        console.error("Error submitting reply", error);
      }
    };
  
    const handleCancelReply = (parentId: number) => {
      setReplyingTo(null);
      setReplyContent({ ...replyContent, [parentId]: "" }); // Clear the content of the reply form
    };
  
    useEffect(() => {
      fetchPost();
      fetchComments(page);
    }, [id, page, 5]);
  
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
    };
  
    const renderComments = (comments: (Comment & { replies: Comment[] })[], level = 0) => {
      return comments.map((comment) => (
        !comment.isHidden && (
          <Box key={comment.id} sx={{ pl: level * 3, mb: 2, borderLeft: level > 0 ? "2px solid #ddd" : "none" }}>
            <Typography variant="body1">{comment.content}</Typography>
            <Typography variant="body2" color="textSecondary">
              {new Date(comment.createdAt).toLocaleDateString()} | Rating Count: {comment.ratingCount} | Report Count: {comment.reportCount}
            </Typography>
  
            {/* Reply Button */}
            <Button
              variant="text"
              size="small"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} // Toggle reply form
            >
              Reply
            </Button>
  
            {/* Reply Form */}
            {replyingTo === comment.id && (
              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                <TextField
                  value={replyContent[comment.id] || ""}
                  onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                  variant="outlined"
                  size="small"
                  sx={{ flexGrow: 1 }}
                  placeholder="Write a reply..."
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleReplySubmit(comment.id)}
                >
                  Post
                </Button>
                <Button
                  variant="text"
                  color="secondary"
                  size="small"
                  onClick={() => handleCancelReply(comment.id)}
                >
                  Cancel
                </Button>
              </Box>
            )}
  
            {comment.replies && renderComments(comment.replies, level + 1)}
          </Box>
        )
      ));
    };
  
    if (!post) return <div>Loading...</div>;
  
    const commentTree = buildCommentTree(comments);
  
    return (
      <Container sx={{ pt: 3, pb: 3 }}>
        <Box sx={{ padding: 3, border: "1px solid #ddd", borderRadius: 2 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            {post.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {new Date(post.createdAt).toLocaleDateString()} | Updated on: {new Date(post.updatedAt).toLocaleDateString()}
          </Typography>
  
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Rating Count: {post.ratingCount} |
            <Button 
                variant="text" 
                size="small"
                color="error" 
                sx={{ ml: 2, textDecoration: 'underline' }} 
                onClick={() => handleReport(post.id)}
            >
                Report
            </Button>
            </Typography>
  
          <Typography variant="body1" sx={{ mb: 3 }}>
            {post.content}
          </Typography>
  
          {/* Display Comments */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Comments:
            </Typography>
            {commentTree.length === 0 ? (
              <Typography variant="body2">No comments yet.</Typography>
            ) : (
              renderComments(commentTree)
            )}
          </Box>
  
          {/* Comment Box */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Add a Comment:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write your comment..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCommentSubmit}
              disabled={!commentContent.trim()}
            >
              Comment
            </Button>
          </Box>
  
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
        </Box>
      </Container>
    );
  };
  
  

export default PostDetailPage;
