import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Post, Comment } from "../interfaces";

interface RatingsButtonsProps {
  isVoting: boolean;
  userId: string | null;
  element: Post | Comment;
  targetType: "post" | "comment";
  onReport: (targetType: "post" | "comment", targetId: number) => void;
  onVote: (
    targetType: "post" | "comment",
    target: Post | Comment,
    value: number
  ) => void;
  openEditPostDialog: () => void;
  onDelete: (targetType: "post" | "comment", target: Post | Comment) => void;
}

const RatingsButtons = ({
  isVoting,
  userId,
  targetType,
  element,
  onReport,
  onVote,
  openEditPostDialog,
  onDelete,
}: RatingsButtonsProps) => (
  <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
    {targetType === "post" && element.authorId === userId && (
      <Button
        className={`w-${targetType === "post" ? "12" : "9"}`}
        variant="text"
        size="medium"
        onClick={openEditPostDialog}
      >
        Edit
      </Button>
    )}

    <Button
      variant="text"
      size={targetType === "comment" ? "small" : "medium"}
      color="error"
      onClick={() => onReport(targetType, element.id)}
    >
      Report
    </Button>

    {targetType === "post" && element.authorId === userId && (
      <Button
        variant="text"
        size={"medium"}
        color="error"
        onClick={() => onDelete(targetType, element)}
      >
        Delete
      </Button>
    )}

    <Button
      className={`w-${targetType === "post" ? "9" : "6"}`}
      sx={{
        fontSize: 20,
        color: element.userRating?.value === 0 ? "#447cec" : "grey",
        minWidth: "auto",
      }}
      onClick={() => !isVoting && onVote(targetType, element, 0)}
    >
      ▼
    </Button>

    <Typography>
      {" "}
      {element.ratingCount > 0
        ? `+${element.ratingCount}`
        : `${element.ratingCount}`}
    </Typography>

    <Button
      className={`w-${targetType === "post" ? "9" : "6"}`}
      sx={{
        fontSize: 20,
        color: element.userRating?.value === 1 ? "#447cec" : "grey",
        minWidth: "auto",
      }}
      onClick={() => !isVoting && onVote(targetType, element, 1)}
    >
      ▲
    </Button>
  </Box>
);

export default RatingsButtons;
