import React from "react";
import { Box, Typography } from "@mui/material";

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
}

interface PostListProps {
  posts: Post[];
  onPostClick: (postId: number) => void;
}
const PostList = ({ posts, onPostClick }: PostListProps) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
    {posts.map((post) => (
      <Box
        key={post.id}
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          padding: 2,
          backgroundColor: "#fff",
          cursor: "pointer",
        }}
        onClick={() => onPostClick(post.id)}
      >
        <Typography variant="h6">{post.title}</Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {post.description}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Created At: {new Date(post.createdAt).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Rating: {post.ratingCount > 0 ? `+${post.ratingCount}` : `${post.ratingCount}`}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default PostList;
