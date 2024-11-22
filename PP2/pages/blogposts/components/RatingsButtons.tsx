import React from "react";
import { Box, Typography, Button } from "@mui/material";

interface Rating {
    id: number,
    value: number,
    targetType: "post" | "comment",
    userId: number,
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
  authorId: number;
  codeTemplates: { id: number; title: string }[];
  tags: { id: number; name: string }[];
  userRating?: Rating
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
  repliesCount: number;
  userRating?: Rating;
}

interface RatingsButtonsProps {
    element: Post | Comment;
    targetType: "post" | "comment";
    onReport: (targetType: "post" | "comment", targetId: number) => void;
    onVote: (targetType: "post" | "comment", target: Post | Comment, value: number) => void;
}

const RatingsButtons = ({ targetType, element, onReport, onVote }: RatingsButtonsProps) => (
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", 
    }}>
        <Button 
            variant="text" 
            size={targetType === "comment" ? "small" : "medium"}
            color="error" 
            onClick={() => onReport("post", element.id)}
            >
            Report
        </Button>

        <Typography sx={{ fontSize: 25, color: '#e0e0e0' }}>|</Typography>
        
        <Button
            className="w-10"
            sx={{
                fontSize: targetType === "comment" ? 20 : 25,
                color: element.userRating?.value === 0 ? "#447cec" : "grey",
            }}
            onClick={() => onVote(targetType, element, 0)}
        >
        ▼
        </Button>

        <Typography>{element.ratingCount}</Typography>
        
        <Button
            className="w-10"
            sx={{
                fontSize: targetType === "comment" ? 20 : 25,
                color: element.userRating?.value === 1 ? "#447cec" : "grey",
            }}
            onClick={() => onVote(targetType, element, 1)}
        >▲</Button>
  </Box>
);

export default RatingsButtons;
