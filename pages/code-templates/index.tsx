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
  const router = useRouter();
  const { auth } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState({ title: "", explanation: "" });
  const [appliedSearch, setAppliedSearch] = useState({
    title: "",
    explanation: "",
  });
  const [searchTags, setSearchTags] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  const [postsPerPage, setPostsPerPage] = useState(5);
  const [mounted, setMounted] = useState(false);

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
          appliedSearch.title,
          appliedSearch.explanation,
          appliedTags,
          page,
          postsPerPage
        );
      } else {
        response = await API.code.getPaginatedTemplates(
          auth.accessToken,
          appliedSearch.title,
          appliedSearch.explanation,
          appliedTags,
          page,
          postsPerPage
        );
      }
      setPosts(response.data.templates);
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

  const handlePostClick = (postId: number) => {
    router.push(`/code-template?id=${window.btoa(String(postId))}`);
  };

  const updateURL = () => {
    const queryParams = {
      ...router.query,
      title: search.title || undefined,
      explanation: search.explanation || undefined,
      tags: tags.length ? tags.join(",") : undefined,
      page: page !== 1 ? page : undefined,
      postsPerPage: postsPerPage !== 5 ? postsPerPage : undefined,
    };

    Object.keys(queryParams).forEach(
      (key) => queryParams[key] === undefined && delete queryParams[key]
    );

    router.replace(
      {
        pathname: router.pathname,
        query: queryParams,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSearchClick = () => {
    setPage(1);
    setAppliedSearch(search);
    setAppliedTags(tags);
    updateURL();
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const {
        title = "",
        explanation = "",
        tags: queryTags = "",
        page: queryPage = "1",
        postsPerPage: queryPostsPerPage = "5",
      } = router.query;

      const newSearch = {
        title: Array.isArray(title) ? title[0] : title,
        explanation: Array.isArray(explanation) ? explanation[0] : explanation,
      };

      const newTags = queryTags
        ? (Array.isArray(queryTags) ? queryTags[0] : queryTags)
            .split(",")
            .filter(Boolean)
        : [];

      const newPage =
        parseInt(Array.isArray(queryPage) ? queryPage[0] : queryPage) || 1;
      const newPostsPerPage =
        parseInt(
          Array.isArray(queryPostsPerPage)
            ? queryPostsPerPage[0]
            : queryPostsPerPage
        ) || 5;

      setSearch(newSearch);
      setAppliedSearch(newSearch);
      setTags(newTags);
      setAppliedTags(newTags);
      setPage(newPage);
      setPostsPerPage(newPostsPerPage);
    }
  }, [mounted, router.query]);

  useEffect(() => {
    if (mounted) {
      updateURL();
    }
  }, [page, postsPerPage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchPosts();
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchData();
  }, [page, postsPerPage, appliedSearch, appliedTags]);

  if (!mounted) return <CircularProgress />;

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
              Code Templates{" "}
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
