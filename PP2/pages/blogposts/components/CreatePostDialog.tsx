import React, { useState } from "react";
import { Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import API from "@/routes/API";

interface CreatePostDialogProps {
  open: boolean;
  newPost: {
    title: string;
    description: string;
    content: string;
    tags: string[];
    codeTemplateLinks: string[];
  };
  onClose: () => void;
  onChange: (field: string, value: string | string[]) => void;
  onSubmit: () => void;
}

const CreatePostDialog = ({
  open,
  newPost,
  onClose,
  onChange,
  onSubmit
}: CreatePostDialogProps) => {
  const [currentTag, setCurrentTag] = useState("");
  const [currentLink, setCurrentLink] = useState("");

  const handleTagsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(event.key)) {
      event.preventDefault();
      if (currentTag.trim() && !newPost.tags.includes(currentTag.trim())) {
        onChange("tags", [...newPost.tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    const updatedTags = newPost.tags.filter(tag => tag !== tagToDelete);
    onChange("tags", updatedTags);
  };


  const handleLinkKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(event.key)) {
      event.preventDefault();
      const trimmedLink = currentLink.trim();
      if (trimmedLink && !newPost.codeTemplateLinks.includes(trimmedLink)) {
        onChange("codeTemplateLinks", [...newPost.codeTemplateLinks, trimmedLink]);
      }
      setCurrentLink("");
    }
  };

  const handleLinkDelete = (linkToDelete: string) => {
    const updatedLinks = newPost.codeTemplateLinks.filter(link => link !== linkToDelete);
    onChange("codeTemplateLinks", updatedLinks); 
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Blog Post</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={newPost.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={newPost.description}
          onChange={(e) => onChange("description", e.target.value)}
        />
        <TextField
          label="Content"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={newPost.content}
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
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', marginBottom: 2 }}>
          {newPost.tags.map((tag) => (
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
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', marginBottom: 2 }}>
          {newPost.codeTemplateLinks.map((link) => (
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
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostDialog;
