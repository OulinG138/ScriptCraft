import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Post } from "../interfaces";
import FlagIcon from "@mui/icons-material/Flag";

interface PostListProps {
  isLoading: boolean;
  posts: Post[];
  onPostClick: (postId: number) => void;
}

const PostList = ({ isLoading, posts, onPostClick }: PostListProps) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
    {isLoading && <CircularProgress />}

    {!isLoading && posts.length === 0 && (
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        {" "}
        No Posts{" "}
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
        <Box className="flex justify-between items-center">
          <Typography variant="h6">{post.title}</Typography>

          {post.isHidden && (
            <Box className="text-red-500 flex">
              <FlagIcon />
              <Typography variant="body1">HIDDEN</Typography>
            </Box>
          )}
        </Box>

        <Typography variant="body1" color="black">
          {post.description}
        </Typography>

        <Typography variant="body2" color="textSecondary">
          By{" "}
          {`${post.author.firstName} ${post.author.lastName} ${post.authorId.slice(-5)}`}{" "}
          | Posted: {new Date(post.createdAt).toLocaleDateString()} | Last
          Updated: {new Date(post.updatedAt).toLocaleDateString()} | Rating:{" "}
          {post.ratingCount > 0
            ? `+${post.ratingCount}`
            : `${post.ratingCount}`}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default PostList;
