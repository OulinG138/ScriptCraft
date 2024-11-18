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
      await axios.post(`/api/posts/${id}/comments`, {commentContent});
      setCommentContent("");
      fetchComments(page);
    } catch (error) {
      console.error("Error submitting comment", error);
    }
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
        <Box
          key={comment.id}
          sx={{
            pl: level * 3,
            mb: 2,
            borderLeft: level > 0 ? "2px solid #ddd" : "none",
          }}
        >

          <Typography variant="body1">{comment.content}</Typography>
          <Typography variant="body2" color="textSecondary">
            {new Date(comment.createdAt).toLocaleDateString()} | Rating Count: {comment.ratingCount} | Report Count: {comment.reportCount}
          </Typography>
          {renderComments(comment.replies, level + 1)}
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
          Rating Count: {post.ratingCount} | Report Count: {post.reportCount}
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
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

        <Box sx={{ mt: 3 }}>
          {post.codeTemplates.length > 0 && (
            <>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Code Templates:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {post.codeTemplates.map((template) => (
                  <Link key={template.id} href={`/codeTemplates/${template.id}`} passHref>
                    <Typography
                      variant="body2"
                      sx={{ color: "primary.main", textDecoration: "underline" }}
                    >
                      {template.title}
                    </Typography>
                  </Link>
                ))}
              </Box>
            </>
          )}
        </Box>

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
