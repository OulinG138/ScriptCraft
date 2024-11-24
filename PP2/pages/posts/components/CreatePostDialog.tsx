import React, { useState } from "react";
import { Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Snackbar, Alert } from "@mui/material";
import API from "@/routes/API";

interface CreatePostDialogProps {
  dialogType: "create" | "edit";
  open: boolean;
  post: {
    title: string;
    description: string;
    content: string;
    tags: string[];
    codeTemplateLinks: string[];
    codeTemplateIds: number[]
  };
  onClose: () => void;
  onChange: ((field: string, value: string | string[] | number[]) => void);
  onSubmit: () => void;
  openSnackbar: boolean;
  onCloseSnackbar: () => void;
  message: string;
}

const CreatePostDialog = ({
  dialogType,
  open,
  post,
  onClose,
  onChange,
  onSubmit,
  openSnackbar,
  onCloseSnackbar,
  message
}: CreatePostDialogProps) => {
  const [currentTag, setCurrentTag] = useState("");
  const [currentLink, setCurrentLink] = useState("");
  const [isLinkValid, setIsLinkValid] = useState(true); 

  const handleTagsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(event.key)) {
      event.preventDefault();
      if (currentTag.trim() && !post.tags.includes(currentTag.trim())) {
        onChange("tags", [...post.tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    const updatedTags = post.tags.filter(tag => tag !== tagToDelete);
    onChange("tags", updatedTags);
  };

  const handleLinkKeyDown = async(event: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(event.key)) {
      event.preventDefault();
      const link = currentLink.trim();
      const origin = window.location.origin.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');
      const regex = new RegExp(`^${origin}/code-template\\?id=([\\x21\\x23-\\x5B\\x5D\\x5E\\x60\\x61-\\x7A\\x7C-\\x7E0-9a-zA-Z-_]+)$`);
      const match = link.match(regex);
      
      if (match) {
        try {
          const codeTemplateId = Number(window.atob(match[1]));
          const response = await API.code.getTemplate(codeTemplateId);
          if (link && !post.codeTemplateLinks.includes(link)) {
            onChange("codeTemplateLinks", [...post.codeTemplateLinks, link]);
          }
          if (!post.codeTemplateIds.includes(codeTemplateId)) {
            onChange("codeTemplateIds", [...post.codeTemplateIds, codeTemplateId]);
          }
          setCurrentLink("");
          setIsLinkValid(true);
        } catch (e) {
          setIsLinkValid(false);
        }
      } else {
        setIsLinkValid(false);
      }
      if (link === "") {
        setIsLinkValid(true)
      }
    }
  };

  const handleLinkDelete = (linkToDelete: string) => {
    const updatedLinks = post.codeTemplateLinks.filter(link => link !== linkToDelete);
    onChange("codeTemplateLinks", updatedLinks); 
    const origin = window.location.origin.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');
    const regex = new RegExp(`^${origin}/code-template\\?id=([\\x21\\x23-\\x5B\\x5D\\x5E\\x60\\x61-\\x7A\\x7C-\\x7E0-9a-zA-Z-_]+)$`);
    const match = linkToDelete.match(regex);
    let idToDelete: number;
    if (match) {
        idToDelete = Number(window.atob(match[1]));
    }
    const updatedIds = post.codeTemplateIds.filter(id => id !== idToDelete);
    onChange("codeTemplateIds", updatedIds); 
  };

  return (
    <>
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{dialogType === 'create' ? 'Create Blog Post' : 'Edit Blog Post'}</DialogTitle>

      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={post.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={post.description}
          onChange={(e) => onChange("description", e.target.value)}
        />
        <TextField
          label="Content"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={post.content}
          onChange={(e) => onChange("content", e.target.value)}
        />
        <TextField
          label="Tags"
          variant="outlined"
          size="small"
          fullWidth
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyDown={handleTagsKeyDown}
          sx={{ marginRight: 2 }}
          placeholder="Press enter to add tag"
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', marginBottom: 2 }}>
          {post.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleTagDelete(tag)}
              sx={{ marginRight: 1, marginBottom: 1 }}
            />
          ))}
        </Box>

        <TextField
          label="Code Template Links"
          fullWidth
          variant="outlined"
          size="small"
          value={currentLink}
          onChange={(e) => setCurrentLink(e.target.value)}
          onKeyDown={handleLinkKeyDown}
          sx={{ marginRight: 2 }}
          placeholder="Press enter to link template"
        />

        {!isLinkValid && (
          <p style={{ color: 'red' }}>Not a valid link</p>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', marginBottom: 2 }}>
          {post.codeTemplateLinks.map((link) => (
            <Chip
              key={link}
              label={link}
              onDelete={() => handleLinkDelete(link)}
              sx={{ marginRight: 1, marginBottom: 1 }}
            />
          ))}
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          {dialogType === 'create' ? "Submit" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
    <Snackbar 
      open={openSnackbar} 
      autoHideDuration={5000} 
      onClose={onCloseSnackbar}
    >
      <Alert 
        onClose={onCloseSnackbar} 
        severity="info" 
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
    </>
  );
};

export default CreatePostDialog;
