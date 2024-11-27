import React from "react";
import {
  Chip,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Auth } from "../../types/interfaces";

interface SearchBarProps {
  auth: Auth;
  search: {
    title: string;
    explanation: string;
  };
  setSearch: React.Dispatch<
    React.SetStateAction<{
      title: string;
      explanation: string;
    }>
  >;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onTagsChange: (tags: string) => void;
  searchTags: string;
  onClick: () => void;
  onTagsKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  sortBy: string;
  onSortChange: (event: SelectChangeEvent<string>) => void;
  tags: string[];
  onTagDelete: (tag: string) => void;
  postsPerPage: number;
  onPostsPerPageChange: (event: SelectChangeEvent<number>) => void;
}

const TemplatesSearchBar = ({
  search,
  setSearch,
  onKeyDown,
  onTagsChange,
  searchTags,
  onClick,
  onTagsKeyDown,
  sortBy,
  onSortChange,
  tags,
  onTagDelete,
  postsPerPage,
  onPostsPerPageChange,
}: SearchBarProps) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Box aria-label="line-1" sx={{ gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "column", md: "row", lg: "row" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row", md: "row", lg: "row" },
            gap: 2,
            maxWidth: "100%",
            flex: 1,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <TextField
              label="Title"
              variant="outlined"
              size="small"
              value={search.title}
              onChange={(e) => setSearch({ ...search, title: e.target.value })}
              onKeyDown={onKeyDown}
              sx={{ width: "100%" }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <TextField
              label="Explanation"
              variant="outlined"
              size="small"
              value={search.explanation}
              onChange={(e) =>
                setSearch({ ...search, explanation: e.target.value })
              }
              onKeyDown={onKeyDown}
              sx={{ width: "100%" }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: "row",
            width: { sm: "100%", xs: "100%", md: "auto" },
          }}
        >
          <Box sx={{}}>
            <TextField
              label="Tags"
              variant="outlined"
              size="small"
              value={searchTags}
              onChange={(e) => onTagsChange(e.target.value)}
              onKeyDown={onTagsKeyDown}
            />
          </Box>
          <Box aria-label="search-button" sx={{ flexGrow: 1 }}>
            <Button
              variant="contained"
              onClick={onClick}
              sx={{
                whiteSpace: "nowrap",
                height: "100%",
                width: { xs: "100%", sm: "100%", md: "auto" },
              }}
            >
              <SearchIcon sx={{ pr: 1 }}></SearchIcon>
              Search
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>

    <Box aria-label="line-2" sx={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ display: "flex", gap: 1, flexDirection: "row" }}>
        {/* <Box aria-label="sort-by-box" sx={{ width: { xs: '100%', sm: '100%', md: 'auto'}}}>
          <FormControl>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={onSortChange}
              label="Sort By"
              size="small"
            >
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="ratings">Ratings</MenuItem>
            </Select>
          </FormControl>
        </Box> */}

        <Box
          aria-label="pagination-box"
          sx={{ width: { xs: "100%", sm: "100%", md: "auto" } }}
        >
          <FormControl
            sx={{
              minWidth: "110px",
              width: { xs: "auto", sm: "100%", md: "auto" },
            }}
          >
            <InputLabel>Posts Per Page</InputLabel>
            <Select
              value={postsPerPage}
              onChange={onPostsPerPageChange}
              label="Posts Per Page"
              sx={{ minWidth: "fit-content" }}
              size="small"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box
        aria-label="tag-chip"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          width: "100%",
          maxWidth: "100%",
          justifyContent: "flex-end",
        }}
      >
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => onTagDelete(tag)}
            sx={{ marginRight: 1, mt: 1.5 }}
          />
        ))}
      </Box>
    </Box>
  </Box>
);

export default TemplatesSearchBar;
