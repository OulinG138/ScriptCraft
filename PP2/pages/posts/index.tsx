import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";

import { 
  Typography, Container, Pagination, SelectChangeEvent, CircularProgress
} from "@mui/material";

import CreatePostDialog from "./components/CreatePostDialog";
import SearchBar from "../../components/SearchBar";
import PostList from "./components/PostList";
import Alert from "../../components/Alert";

import { Post } from "../../components/interfaces";

import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";

const BlogPostsPage = ({ user = false }: { user?: boolean }) => {
  // basic router and authentication
  const router = useRouter();
  const { auth } = useAuth();
  const LOCAL_STORAGE_KEY = user ? "userBlogSearchState" : "blogSearchState";

  // posts states
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);

  // search states
  const [search, setSearch] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("ratings");
  const [postsPerPage, setPostsPerPage] = useState(5);

  // create post states
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    content: "",
    tags: [] as string[],
    codeTemplateLinks: [] as string[],
    codeTemplateIds: [] as number[]
  });

  // snackbar alert states
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // post handlers
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      let response;
      if (user) {
        if (!auth.accessToken) {
          setSnackbarMessage("Error: Please log out and try again");
          setOpenSnackbar(false);
          return
        }
        response = await API.blogpost.getUserBlogPosts(
          auth.accessToken,
          search,
          tags,
          sortBy,
          page,
          postsPerPage
        );
      } else {
        response = await API.blogpost.getPaginatedBlogPosts(
          auth.accessToken,
          search,
          tags,
          sortBy,
          page,
          postsPerPage
        );
      }
      setPosts(response.data.posts);
      setTotalPosts(response.data.totalPosts);
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setIsLoading(false);
    }
  };;

  const onPostsPerPageChange = (event: SelectChangeEvent<number>) => {
    setPostsPerPage(Number(event.target.value));
    setPage(1);
  };
  
  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value);
  };

  const handlePostClick = (postId: number) => {
    router.push(`/posts/${window.btoa(String(postId))}`);
  };

  useEffect(() => {
    fetchPosts();
  }, [page, sortBy, tags, postsPerPage]);

  // search handlers
  const handleSearchClick = () => {
    setPage(1);
    fetchPosts();
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  // create post handlers
  const openCreatePostDialog = () => {
    if (auth.user) {
      setCreatePostDialogOpen(true);
    } else {
      router.push('/login');
    }
  };

  const closeCreatePostDialog = () => {
    setCreatePostDialogOpen(false);
    setNewPost({ title: "", description: "", content: "", tags: [], codeTemplateLinks: [], codeTemplateIds: []});
  };

  const handleCreatePostChange = (field: string, value: string | string[] | number[]) => {
    setNewPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", " ", ","].includes(event.key)) {
      event.preventDefault();
      const trimmedTag = searchTags.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTags((prevTags) => [...prevTags, trimmedTag]);
        setSearchTags("");
      } else if (tags.includes(trimmedTag)) {
        setSearchTags("");
      }
    }
  };  
  
  const handleTagDelete = (tagToDelete: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToDelete));
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load state from localStorage once mounted
  useEffect(() => {
    if (mounted) {
      const savedState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
      setSearch(savedState.search || "");
      setTags(savedState.tags || []);
      setSortBy(savedState.sortBy || "ratings");
      setPage(savedState.page || 1);
      setPostsPerPage(savedState.postsPerPage || 5);
    }
  }, [mounted]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ search, tags, sortBy, page, postsPerPage })
      );
    }
  }, [search, tags, sortBy, page, postsPerPage, mounted]);

  // Avoid rendering the component until mounted
  if (!mounted) {
    return <CircularProgress />;
  }
  
  return (
    <Container sx={{ mb: 5, mt: 5 }}>
      <Typography variant="h4" className="pb-5">{user ? "User Blog Posts" : "Blog Posts"} </Typography>

      <SearchBar
        auth={auth}
        type={'post'}
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

      <PostList isLoading={isLoading} posts={posts} onPostClick={handlePostClick}/>

      {posts.length > 0 &&
        <Pagination
        sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}
        count={Math.ceil(totalPosts / postsPerPage)}
        page={page}
        onChange={handlePageChange}
        color="primary"
      />
      }

      {createPostDialogOpen &&
        <CreatePostDialog 
          dialogType="create"
          open={createPostDialogOpen}
          post={newPost}
          onClose={closeCreatePostDialog}
          onChange={handleCreatePostChange}
          onSubmit={handleCreatePostSubmit}
        />
      }
      
      <Alert message={snackbarMessage} openSnackbar={openSnackbar} setOpenSnackbar={setOpenSnackbar} />
    </Container>
  );
};

export default BlogPostsPage;
