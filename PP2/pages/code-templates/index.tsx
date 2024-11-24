import React, { useState, useEffect, ChangeEvent } from "react";
import { 
  Typography, Container, Pagination, SelectChangeEvent
} from "@mui/material";

import { useRouter } from "next/router";
import TemplateList from "./components/TemplateList";
import Alert from "../posts/components/Alert";
import SearchBar from "./components/SearchBar";
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";

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

  // snackbar alert states
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // post handlers
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await API.code.getPaginatedTemplates(
        auth.accessToken,
        search,
        tags,
        page,
        postsPerPage
      );
      setPosts(response.data.templates);
      console.log(response.data)
      setTotalPosts(response.data.totalPosts);
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
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
  return (
    <Container sx={{ pt: 2, pb: 2 }}>
      <Typography variant="h4" className="pb-5">Code Templates</Typography>

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
          onCreatePostClick={()=> router.push('/coding')}
          tags={tags}
          onTagDelete={handleTagDelete}
          postsPerPage={postsPerPage}
          onPostsPerPageChange={onPostsPerPageChange}
        />

      <TemplateList isLoading={isLoading} posts={posts} onPostClick={handlePostClick}/>

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

export default BlogPostsPage;
