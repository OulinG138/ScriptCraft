import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface Post {
  id: number;
  title: string;
  explanation: string;
  codeContent: string;
  language: string;
  authorId: string;
  parentTemplateId: number;
  tags: [{ id: number; name: string }];
  author: { firstName: string; lastName: string };
  createdAt: Date;
  updatedAt: Date;
}

interface PostListProps {
  isLoading: boolean;
  posts: Post[];
  onPostClick: (postId: number) => void;
}

const PostList = ({ isLoading, posts, onPostClick }: PostListProps) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
    {isLoading && <CircularProgress />}
    {!isLoading && posts.length === 0 && (
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          color: "rgba(0, 0, 0, 0.87)",
        }}
      >
        No Templates
      </Typography>
    )}
    {posts.map((post) => (
      <Box
        key={post.id}
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          padding: 3,
          backgroundColor: "#fff",
          cursor: "pointer",
        }}
        onClick={() => onPostClick(post.id)}
      >
        <Typography
          variant="h6"
          sx={{
            color: "rgba(0, 0, 0, 0.87)",
            mb: 1,
          }}
        >
          {post.title}
        </Typography>
        <Typography variant="body1" color="black">
          Language: {post.language}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(0, 0, 0, 0.87)",
          }}
        >
          By{" "}
          {`${post.author.firstName} ${post.author.lastName} ${post.authorId.slice(-5)}`}{" "}
          | Posted: {new Date(post.createdAt).toLocaleDateString()} | Last
          Updated: {new Date(post.updatedAt).toLocaleDateString()}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default PostList;
