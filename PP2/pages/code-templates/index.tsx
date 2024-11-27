import React, { useState, useEffect, ChangeEvent } from "react";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Typography,
  Container,
  Pagination,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/router";
import TemplateList from "@/components/templates/TemplateList";
import TemplatesSearchBar from "@/components/templates/TemplatesSearchBar";
import useAuth from "@/hooks/useAuth";
import API from "@/routes/API";

interface Post {
  id: number;
  title: string;
  explanation: string;
  codeContent: string;
  language: string;
  authorId: string;
  parentTemplateId: number;
  tags: [{ id: number; name: string }];
  author: { firstName: string; lastName: string };
  createdAt: Date;
  updatedAt: Date;
}

const TemplatesPage = ({ user = false }: { user?: boolean }) => {
  const LOCAL_STORAGE_KEY = user
    ? "userTemplateSearchState"
    : "templateSearchState";

  // basic router and authentication
  const router = useRouter();
  const { auth } = useAuth();

  // posts states
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);

  // search states
  const [search, setSearch] = useState({ title: "", explanation: "" });
  const [searchTags, setSearchTags] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("ratings");
  const [postsPerPage, setPostsPerPage] = useState(5);

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
        response = await API.code.getUserTemplates(
          auth.accessToken,
          search.title,
          search.explanation,
          tags,
          page,
          postsPerPage
        );
        setPosts(response.data.templates);
        setTotalPosts(response.data.totalPosts);
      } else {
        response = await API.code.getPaginatedTemplates(
          auth.accessToken,
          search.title,
          search.explanation,
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
      setSearch(savedState.search || { title: "", explanation: "" });
      setTags(savedState.tags || []);
      setSortBy(savedState.sortBy || "ratings");
      setPage(savedState.page || 1);
      setPostsPerPage(savedState.postsPerPage || 5);
    }
  }, [mounted]);

  // // Save state to sessionStorage whenever it changes
  // useEffect(() => {
  //   if (mounted) {
  //     sessionStorage.setItem(
  //       LOCAL_STORAGE_KEY,
  //       JSON.stringify({ search, tags, sortBy, page, postsPerPage })
  //     );
  //   }
  // }, [search, tags, sortBy, page, postsPerPage, mounted]);

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
          <Box sx={{ display: "flex", flexDirection: "row", mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                whiteSpace: "nowrap",
                width: "auto",
                color: "rgba(0, 0, 0, 1)",
              }}
            >
              {user ? "My Code Templates" : "Code Templates"}{" "}
            </Typography>

            {auth && (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  width: { xs: "100%", sm: "100%", md: "auto" },
                  flexGrow: { md: 1, xs: 0, sm: 0 },
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => router.push("/coding")}
                  sx={{ whiteSpace: "nowrap", width: "auto" }}
                >
                  <EditIcon sx={{ pr: 1 }}> </EditIcon>
                  Create Template
                </Button>
              </Box>
            )}
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

          <Box sx={{ mt: 3 }}>
            <TemplateList
              isLoading={isLoading}
              posts={posts}
              onPostClick={handlePostClick}
            />
          </Box>

          {posts.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
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
                count={Math.ceil(totalPosts / postsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default TemplatesPage;
