import React, { useState, useEffect, ChangeEvent } from "react";
import { 
  Container, TextField, Button, Typography, Box, Pagination, 
  MenuItem, Select, InputLabel, FormControl, Chip, SelectChangeEvent, 
  Dialog, DialogTitle, DialogContent, DialogActions 
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/router";

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

const BlogPostsPage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("ratings");
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    content: "",
    tags: [] as string[],
    codeTemplateIds: [] as number[],
  });

  const fetchPosts = async () => {
    try {
      const response = await axios.get("/api/posts", {
        params: {
          search,
          searchTags: tags.join(","),
          sortBy,
          page,
          limit: 5,
        },
      });
      setPosts(response.data.posts);
      setTotalPosts(response.data.totalPosts);
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, sortBy, tags]);

  const handleSearchClick = () => {
    setPage(1);
    fetchPosts();
  };

  const handlePageChange = (event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleTagsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(event.key)) {
      if (searchTags.trim()) {
        setTags((prevTags) => [...prevTags, searchTags.trim()]);
        setSearchTags("");
      }
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToDelete));
  };

  const handlePostClick = (postId: number) => {
    router.push(`/blogposts/${postId}`);
  };

  const openCreatePostDialog = () => {
    setCreatePostDialogOpen(true);
  };

  const closeCreatePostDialog = () => {
    setCreatePostDialogOpen(false);
    setNewPost({ title: "", description: "", content: "", tags: [], codeTemplateIds: [] });
  };

  const handleCreatePostChange = (field: keyof typeof newPost, value: string | string[] | number[]) => {
    setNewPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreatePostSubmit = async () => {
    try {
      await axios.post("/api/posts", newPost);
      closeCreatePostDialog();
      fetchPosts();
    } catch (error) {
      console.error("Error creating post", error);
    }
  };

  return (
    <Container sx={{ pt: 3, pb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <Typography variant="h4">Blog Posts</Typography>
        <Box>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            sx={{ marginRight: 2 }}
          />
          <TextField
            label="Search Tags"
            variant="outlined"
            size="small"
            value={searchTags}
            onChange={(e) => setSearchTags(e.target.value)}
            onKeyDown={handleTagsKeyDown}
            sx={{ marginRight: 2 }}
          />
          <FormControl sx={{ marginRight: 2 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              label="Sort By"
              size="small"
            >
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="ratings">Ratings</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleSearchClick}
            sx={{ marginLeft: 2 }}
          >
            Search
          </Button>
          <Button
            variant="contained"
            onClick={openCreatePostDialog}
            sx={{ marginLeft: 2 }}
          >
            Create Post
          </Button>
        </Box>
      </Box>

      <Box sx={{ marginBottom: 2 }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => handleTagDelete(tag)}
            sx={{ marginRight: 1, marginBottom: 1 }}
          />
        ))}
      </Box>

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
            onClick={() => handlePostClick(post.id)}
          >
            <Typography variant="h6">{post.title}</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {post.description}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Created At: {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Rating Count: {post.ratingCount} | Report Count: {post.reportCount}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
        <Pagination
          count={Math.ceil(totalPosts / 5)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog open={createPostDialogOpen} onClose={closeCreatePostDialog}>
        <DialogTitle>Create Blog Post</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={newPost.title}
            onChange={(e) => handleCreatePostChange("title", e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={newPost.description}
            onChange={(e) => handleCreatePostChange("description", e.target.value)}
          />
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={newPost.content}
            onChange={(e) => handleCreatePostChange("content", e.target.value)}
          />
          <TextField
            label="Tags (comma-separated)"
            fullWidth
            margin="normal"
            value={newPost.tags.join(",")}
            onChange={(e) => handleCreatePostChange("tags", e.target.value.split(","))}
          />
          <TextField
            label="Code Template IDs (comma-separated)"
            fullWidth
            margin="normal"
            value={newPost.codeTemplateIds.join(",")}
            onChange={(e) =>
              handleCreatePostChange("codeTemplateIds", e.target.value.split(",").map(Number))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreatePostDialog}>Cancel</Button>
          <Button onClick={handleCreatePostSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BlogPostsPage;
