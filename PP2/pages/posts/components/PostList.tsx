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
  authorId: string;
  author: {firstName: string, lastName: string}
}

interface PostListProps {
  isLoading: boolean;
  posts: Post[];
  onPostClick: (postId: number) => void;
}
const PostList = ({ isLoading, posts, onPostClick }: PostListProps) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
    {isLoading && <Typography variant="h5"sx={{ textAlign: 'center' }}> Loading... </Typography>}

    {(!isLoading && posts.length === 0) && <Typography variant="h5"sx={{ textAlign: 'center' }}> No Posts </Typography>}

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
        <Typography variant="h6">{post.title}</Typography>

        <Typography variant="body1" color="black">
          {post.description}
        </Typography>

        <Typography variant="body2" color="textSecondary" >
            By {`${post.author.firstName} ${post.author.lastName} ${post.authorId.slice(-5)}`} | Posted: {new Date(post.createdAt).toLocaleDateString()}  | Last Updated: {new Date(post.updatedAt).toLocaleDateString()} | Rating: {post.ratingCount > 0 ? `+${post.ratingCount}` : `${post.ratingCount}`}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default PostList;
