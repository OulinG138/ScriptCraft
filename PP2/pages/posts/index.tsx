import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import {
  Typography,
  Box,
  Button,
  Container,
  Pagination,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import CreatePostDialog from "@/components/posts/CreatePostDialog";
import SearchBar from "@/components/posts/PostsSearchBar";
import PostList from "@/components/posts/PostList";

import { Post } from "@/types/interfaces";

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
  const [search, setSearch] = useState({
    title: "",
    content: "",
    codeTemplate: "",
  });
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
    codeTemplateIds: [] as number[],
  });

  let controller: AbortController | null = null;

  // post handlers
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      let response;
      if (user) {
        if (!auth.accessToken) {
          toast.error("Error: Please log out and try again");
          return;
        }
        response = await API.blogpost.getUserBlogPosts(
          auth.accessToken,
          search.title,
          search.content,
          search.codeTemplate,
          tags,
          sortBy,
          page,
          postsPerPage
        );
        setPosts(response.data.posts);
        setTotalPosts(response.data.totalPosts);
      } else {
        response = await API.blogpost.getPaginatedBlogPosts(
          auth.accessToken,
          search.title,
          search.content,
          search.codeTemplate,
          tags,
          sortBy,
          page,
          postsPerPage
        );
        setPosts(response.data.posts);
        setTotalPosts(response.data.totalPosts);
        console.log("fetched posts:", response.data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    const fetchData = async () => {
      try {
        await fetchPosts();
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchData();
  }, [page, sortBy, tags, postsPerPage]);

  // search handlers
  const handleSearchClick = async () => {
    setPage(1);
    await fetchPosts();
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  // create post handlers
  const openCreatePostDialog = () => {
    if (auth.user) {
      setCreatePostDialogOpen(true);
    } else {
      router.push("/login");
    }
  };

  const closeCreatePostDialog = () => {
    setCreatePostDialogOpen(false);
    setNewPost({
      title: "",
      description: "",
      content: "",
      tags: [],
      codeTemplateLinks: [],
      codeTemplateIds: [],
    });
  };

  const handleCreatePostChange = (
    field: string,
    value: string | string[] | number[]
  ) => {
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
      toast.error("Title, description, and content are required.");
      return;
    }

    if (!auth.accessToken) {
      console.error("Access token is missing");
      toast.error("Error: Login again and retry");
      return;
    }

    try {
      await API.blogpost.postBlogPost(auth.accessToken, newPost);
      closeCreatePostDialog();
      await fetchPosts();
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post", error);
      toast.error("Error: Login again and retry");
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load state from sessionStorage once mounted
  useEffect(() => {
    if (mounted) {
      const savedState = JSON.parse(
        sessionStorage.getItem(LOCAL_STORAGE_KEY) || "{}"
      );
      setSearch(
        savedState.search || { title: "", content: "", codeTemplate: "" }
      );
      setTags(savedState.tags || []);
      setSortBy(savedState.sortBy || "ratings");
      setPage(savedState.page || 1);
      setPostsPerPage(savedState.postsPerPage || 5);
    }
  }, [mounted]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      console.log("saving..", search);
      sessionStorage.setItem(
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container>
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: "background.paper",
            boxShadow: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              {user ? "My Blog Posts" : "Blog Posts"}
            </Typography>

            {auth && (
              <Button
                variant="contained"
                onClick={openCreatePostDialog}
                startIcon={<EditIcon />}
                sx={{
                  px: 3,
                  py: 1,
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Create Post
              </Button>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
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
              tags={tags}
              onTagDelete={handleTagDelete}
              postsPerPage={postsPerPage}
              onPostsPerPageChange={onPostsPerPageChange}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <PostList
              isLoading={isLoading}
              posts={posts}
              onPostClick={handlePostClick}
            />
          </Box>

          {posts.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
              }}
            >
              <Pagination
                count={Math.ceil(totalPosts / postsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "text.primary",
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    },
                  },
                }}
              />
            </Box>
          )}

          {createPostDialogOpen && (
            <CreatePostDialog
              dialogType="create"
              open={createPostDialogOpen}
              post={newPost}
              onClose={closeCreatePostDialog}
              onChange={handleCreatePostChange}
              onSubmit={handleCreatePostSubmit}
            />
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default BlogPostsPage;
