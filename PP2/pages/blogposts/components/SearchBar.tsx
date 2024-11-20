import React from "react";
import { Chip, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

type Auth = {
  user?: {
    firstName: string;
    lastName: string;
    avatarId: number;
  };
  accessToken?: string;
};

interface SearchBarProps {
  auth: Auth;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onTagsChange: (tags: string) => void;
  searchTags: string;
  onClick: () => void;
  onTagsKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  sortBy: string;
  onSortChange: (event: SelectChangeEvent<string>) => void;
  onCreatePostClick: () => void;
  tags: string[];
  onTagDelete: (tag: string) => void;
  postsPerPage: number;
  onPostsPerPageChange: (event: SelectChangeEvent<number>) => void;
}

const SearchBar = ({
  auth,
  search,
  setSearch,
  onKeyDown,
  onTagsChange,
  searchTags,
  onClick,
  onTagsKeyDown,
  sortBy,
  onSortChange,
  onCreatePostClick,
  tags,
  onTagDelete,
  postsPerPage,
  onPostsPerPageChange
}: SearchBarProps) => (
  <div>
    <Typography variant="h4" className="pb-5">Blog Posts</Typography>

    <div>
    <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
      <Box>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={onKeyDown}
          sx={{ marginRight: 2 }}
        />
        <TextField
          label="Search Tags"
          variant="outlined"
          size="small"
          value={searchTags}
          onChange={(e) => onTagsChange(e.target.value)}
          onKeyDown={onTagsKeyDown}
          sx={{ marginRight: 2 }}
        />
        <FormControl sx={{ marginRight: 2 }}>
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

        <FormControl sx={{ marginRight: 2, width: '150px' }}>
        <InputLabel>Posts Per Page</InputLabel>
        <Select
          value={postsPerPage}
          onChange={onPostsPerPageChange}
          label="Posts Per Page"
          size="small"
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
        </Select>
      </FormControl>
      <Button
          variant="contained"
          onClick={onClick}
          sx={{ marginLeft: 2 }}
        >
          Search
        </Button>

      </Box>

  

      {auth && <Button
          variant="contained"
          onClick={onCreatePostClick}
          sx={{ marginLeft: 2 }}
        >
          Create Post
        </Button>}
    </Box>

    <Box sx={{ display: 'flex', flexWrap: 'wrap', marginBottom: 2 }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => onTagDelete(tag)}
            sx={{ marginRight: 1, marginBottom: 1 }}
          />
        ))}
      </Box>
    </div>

  </div>
);

export default SearchBar;
