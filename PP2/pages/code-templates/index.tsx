import React, { useState, useEffect, ChangeEvent } from "react";
import { 
  Box, Button, Typography, Container, Pagination, SelectChangeEvent, CircularProgress
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from "next/router";
import TemplateList from "./components/TemplateList";
import TemplatesSearchBar from "./components/TemplatesSearchBar";
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";

import Alert from "../../components/Alert";

interface Post {
  id: number,
  title: string,
  explanation: string,
  codeContent: string,
  language: string,
  authorId: string,
  parentTemplateId: number,
  tags: [{id: number, name: string}],
  author: {firstName: string, lastName: string},
  createdAt: Date,
  updatedAt: Date
}

const TemplatesPage = ({ user = false }: { user?: boolean }) => {
  const LOCAL_STORAGE_KEY = user ? "userTemplateSearchState" : "templateSearchState";

  // basic router and authentication
  const router = useRouter();
  const { auth } = useAuth();

  // posts states
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);

  // search states
  const [search, setSearch] = useState({ title: "", explanation: ""});
  const [searchTags, setSearchTags] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("ratings");
  const [postsPerPage, setPostsPerPage] = useState(5);

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
        response = await API.code.getUserTemplates(
          auth.accessToken,
          search.title, search.explanation,
          tags,
          page,
          postsPerPage
        );
        setPosts(response.data.templates);
        setTotalPosts(response.data.totalPosts);
      } else {
        response = await API.code.getPaginatedTemplates(
          auth.accessToken,
          search.title, search.explanation,
          tags,
          page,
          postsPerPage
        );
        setPosts(response.data.templates);
        setTotalPosts(response.data.totalPosts);
      }
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      console.log(posts);
      setIsLoading(false);
    }
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
    router.push(`/code-template?id=${window.btoa(String(postId))}`);
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
    <Container sx={{ mb: 5, mt: 5}}>
      <Box sx={{display: "flex", flexDirection: "row"}}> 
        <Typography variant="h4" className="pb-5" sx={{whiteSpace: 'nowrap', width:'auto'}}>{user ? "User Code Templates" : "Code Templates"} </Typography>

        {auth &&
        <Box sx={{ height: "100%", display: 'flex', width: { xs: '100%', sm: '100%', md: 'auto'}, flexGrow: { md: 1, xs: 0, sm: 0}, justifyContent: 'flex-end'  }}>
          <Button
            variant="contained"
            onClick={()=> router.push('/coding')}
            sx={{whiteSpace: 'nowrap', width:'auto'}}
          >
            <EditIcon sx={{ pr: 1}}> </EditIcon>
            Create Template
          </Button>
        </Box>}
      </Box>

      <TemplatesSearchBar
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

      <Box className="mt-5">
        <TemplateList isLoading={isLoading} posts={posts} onPostClick={handlePostClick}/>
      </Box>

      {posts.length > 0 &&
        <Pagination
        sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}
        count={Math.ceil(totalPosts / postsPerPage)}
        page={page}
        onChange={handlePageChange}
        color="primary"
      />
      }

      <Alert message={snackbarMessage} openSnackbar={openSnackbar} setOpenSnackbar={setOpenSnackbar} />
    </Container>
  );
};

export default TemplatesPage;
