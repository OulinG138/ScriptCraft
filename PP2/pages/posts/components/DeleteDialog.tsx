import React, { useState } from "react";
import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import API from "@/routes/API";
import { useRouter } from "next/router";

type User = {
    id: string;
    firstName: string;
    lastName: string;
    avatarId: number;
    isAdmin: boolean;
  };
  
  type Auth = {
    user?: User;
    accessToken?: string;
  };

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

interface DeleteDialogProps {
    auth: Auth,
    openDeleteDialog: boolean,
    setOpenDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>,
    targetType: 'post' | 'comment',
    target: Post | Comment
}

const DeleteDialog = ({
    auth,
    openDeleteDialog,
    setOpenDeleteDialog,
    targetType,
    target
}: DeleteDialogProps) => {
    const router = useRouter();

    const handleConfirmDelete = async () => {
        try {
            await API.blogpost.deleteBlogPost(auth.accessToken as string, target.id);
            setOpenDeleteDialog(false);
            router.back()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
            <Typography> {`Are you sure you want to delete this ${targetType}?`}</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="primary">
            Confirm
            </Button>
        </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;
