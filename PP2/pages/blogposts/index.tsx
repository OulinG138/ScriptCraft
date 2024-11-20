import React, { useState, useEffect, ChangeEvent } from "react";
import { 
  Container, Box, Pagination, SelectChangeEvent,
  Alert, Snackbar
} from "@mui/material";
import { useRouter } from "next/router";
import CreatePostDialog from "./components/CreatePostDialog";
import SearchBar from "./components/SearchBar";
import PostList from "./components/PostList";

import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";

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
  const { auth } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("ratings");
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [postsPerPage, setPostsPerPage] = useState(5);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    content: "",
    tags: [] as string[],
    codeTemplateLinks: [] as string[],
  });
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await API.blogpost.getPaginatedBlogPosts(
        auth.accessToken,
        search,
        tags,
        sortBy,
        page,
        postsPerPage
      );
      setPosts(response.data.posts);
      setTotalPosts(response.data.totalPosts);
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  const onPostsPerPageChange = (event: SelectChangeEvent<number>) => {
    setPostsPerPage(Number(event.target.value));
    setPage(1);
  };
  
  useEffect(() => {
    fetchPosts();
  }, [page, sortBy, tags, postsPerPage]);

  const handleSearchClick = () => {
    setPage(1);
    fetchPosts();
  };

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
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
      event.preventDefault();
      const trimmedTag = searchTags.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTags((prevTags) => [...prevTags, trimmedTag]);
        setSearchTags("");
        console.log("debugging", searchTags);
      } else if (tags.includes(trimmedTag)) {
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
    if (auth.user) {
      setCreatePostDialogOpen(true);
    } else {
      router.push('/login');
    }
  };

  const closeCreatePostDialog = () => {
    setCreatePostDialogOpen(false);
    setNewPost({ title: "", description: "", content: "", tags: [], codeTemplateLinks: [] });
  };

  const handleCreatePostChange = (field: string, value: string | string[]) => {
    setNewPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreatePostSubmit = async () => {
    if (!newPost.title || !newPost.description || !newPost.content) {
      setSnackbarMessage("Title, description, and content are required.");
      setOpenSnackbar(true);
      return;
    }
  
    if (!auth.accessToken) {
      console.error("Access token is missing");
      setSnackbarMessage("Error: Login again and retry");
      setOpenSnackbar(true);
      return;
    }
  
    try {
      await API.blogpost.postBlogPost(auth.accessToken, newPost);
      closeCreatePostDialog();
      fetchPosts();
      setSnackbarMessage("Post created successfully!");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error creating post", error);
      setSnackbarMessage("Error: Login again and retry");
      setOpenSnackbar(true);
    }
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  return (
    <Container sx={{ pt: 3, pb: 3 }}>
        <SearchBar
          auth={auth}
          search={search}
          setSearch={setSearch}
          onKeyDown={handleSearchKeyDown}
          onTagsChange={setSearchTags}
          searchTags={searchTags}
          onClick={handleSearchClick}
          onTagsKeyDown={handleTagsKeyDown}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onCreatePostClick={openCreatePostDialog}
          tags={tags}
          onTagDelete={handleTagDelete}
          postsPerPage={postsPerPage}
          onPostsPerPageChange={onPostsPerPageChange}
        />

      <PostList posts={posts} onPostClick={handlePostClick}></PostList>

      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
        <Pagination
          count={Math.ceil(totalPosts / postsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {createPostDialogOpen && <CreatePostDialog 
        open={createPostDialogOpen}
        newPost={newPost}
        onClose={closeCreatePostDialog}
        onChange={handleCreatePostChange}
        onSubmit={handleCreatePostSubmit}
      >
      </CreatePostDialog>}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="info" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BlogPostsPage;
