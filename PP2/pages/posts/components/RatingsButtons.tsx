import React from "react";
import { Box, Typography, Button } from "@mui/material";

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

interface RatingsButtonsProps {
    isVoting: boolean;
    userId: string | null;
    element: Post | Comment;
    targetType: "post" | "comment";
    onReport: (targetType: "post" | "comment", targetId: number) => void;
    onVote: (targetType: "post" | "comment", target: Post | Comment, value: number) => void;
    openEditPostDialog: () => void;
}

const RatingsButtons = ({isVoting, userId, targetType, element, onReport, onVote, openEditPostDialog}: RatingsButtonsProps) => (
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", 
    }}>
        { (targetType === 'post' && element.authorId === userId) &&
        <Button 
            className={`w-${targetType === 'post' ? '12' : '9'}`} 
            variant="text" 
            size="medium"
            onClick={openEditPostDialog}
            >
            Edit
        </Button>
        }

        <Button 
            variant="text" 
            size={targetType === "comment" ? "small" : "medium"}
            color="error" 
            onClick={() => onReport("post", element.id)}
            >
            Report
        </Button>

        <Button
            className={`w-${targetType === 'post' ? '9' : '6'}`} 
            sx={{
                fontSize: targetType === "comment" ? 19 : 25,
                color: element.userRating?.value === 0 ? "#447cec" : "grey",
                minWidth: 'auto', 
            }}
            onClick={() => !isVoting && onVote(targetType, element, 0)}
            >
        ▼
        </Button>

        <Typography> {element.ratingCount > 0 ? `+${element.ratingCount}` : `${element.ratingCount}`}
        </Typography>
        
        <Button
            className={`w-${targetType === 'post' ? '9' : '6'}`} 
            sx={{
                fontSize: targetType === "comment" ? 19 : 25,
                color: element.userRating?.value === 1 ? "#447cec" : "grey",
                minWidth: 'auto', 
            }}
            onClick={() => !isVoting && onVote(targetType, element, 1)}
        >▲</Button>
  </Box>
);

export default RatingsButtons;
