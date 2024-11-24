import React from "react";
import { Chip, Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { Auth } from './interfaces'

interface SearchBarProps {
  auth: Auth;
  type: "post" | "template";
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
  type,
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
  <Box aria-label="line-1"
    sx={{ display: 'flex', gap: 2, flexDirection: {xs: 'column', sm: 'column', md: 'row' }, mb: 2 }}>

    <Box sx={{gap: 1}} >
      <Box sx={{flex: 1,  display: 'flex', gap: 1, flexDirection: 'row' }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={onKeyDown}
          sx={{width: "100%"}}
        />
        <TextField
          label="Tags"
          variant="outlined"
          size="small"
          value={searchTags}
          onChange={(e) => onTagsChange(e.target.value)}
          onKeyDown={onTagsKeyDown}
          sx={{width:"100%"}}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', maxWidth: '100%' }}>
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



    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'row' }}>
      <Box aria-label="sort-by-box" sx={{ width: { xs: '100%', sm: '100%', md: 'auto'}}}>
        <FormControl sx={{ width: { xs: '100%', sm: '100%', md: 'auto'} }}>
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
      </Box>

      <Box aria-label="pagination-box" sx={{ width: { xs: '100%', sm: '100%', md: 'auto'}}}>
        <FormControl sx={{ minWidth: '130px',  width: { xs: '100%', sm: '100%', md: 'auto'} }}>
          <InputLabel >Posts Per Page</InputLabel>
          <Select
            value={postsPerPage}
            onChange={onPostsPerPageChange}
            label="Posts Per Page"
            sx={{ minWidth: 'fit-content' }}
            size="small"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>

    <Box aria-label='search-button' sx={{ width: { xs: '100%', sm: '100%', md: 'auto'}}} >
      <Button
        variant="contained"
        onClick={onClick}
        sx={{whiteSpace: 'nowrap', width: { xs: '100%', sm: '100%', md: 'auto'}}}
      >
        <SearchIcon sx={{ pr: 1 }} ></SearchIcon>
        Search
      </Button>
    </Box>

    {auth &&
    <Box sx={{ height: "100%", display: 'flex', width: { xs: '100%', sm: '100%', md: 'auto'}, flexGrow: { md: 1, xs: 0, sm: 0}, justifyContent: 'flex-end'  }}>
      <Button
        variant="contained"
        onClick={onCreatePostClick}
        sx={{whiteSpace: 'nowrap', width: { xs: '100%', sm: '100%', md: 'auto'}}}
      >
        <EditIcon sx={{ pr: 1}}> </EditIcon>
        {`Create ${type === 'post' ? 'Post' : 'Template'}`}
      </Button>
    </Box>}
  </Box>
);

export default SearchBar;
