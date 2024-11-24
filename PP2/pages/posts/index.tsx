import React, { useState, useEffect, ChangeEvent } from "react";
import { 
  Container, Pagination, SelectChangeEvent
} from "@mui/material";

import { useRouter } from "next/router";
import CreatePostDialog from "./components/CreatePostDialog";
import SearchBar from "./components/SearchBar";
import PostList from "./components/PostList";
import Alert from "./components/Alert";
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
  authorId: string;
  author: {firstName: string, lastName: string}
}

const BlogPostsPage = () => {
  // basic router and authentication
  const router = useRouter();
  const { auth } = useAuth();

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

  return (
    <Container sx={{ pt: 2, pb: 2 }}>
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
