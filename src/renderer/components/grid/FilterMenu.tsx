import { useState } from 'react';
// Material UI
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// Icons
import FilterIcon from '@mui/icons-material/FilterAltOutlined';
import CheckIcon from '@mui/icons-material/Check';

export type FilterValue = 'show-all-files' | 'show-renamed-files';
export type Filter = { label: string; value: FilterValue };

type FilterMenuProps = {
  filters: Filter[];
  currentFilter: FilterValue;
  onFilterClick: (filter: FilterValue) => void;
};

export default function FilterMenu({
  filters,
  currentFilter,
  onFilterClick,
}: FilterMenuProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (filterValue: FilterValue): void => {
    onFilterClick(filterValue);
    handleClose();
  };

  return (
    <>
      <Button
        id="menu-button"
        aria-label="filter"
        size="small"
        aria-controls={open ? 'filter-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <FilterIcon />
      </Button>
      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'menu-button',
        }}
      >
        {filters.map((filter) => (
          <MenuItem
            key={filter.value}
            onClick={() => handleSelect(filter.value)}
          >
            {filter.value === currentFilter && (
              <ListItemIcon>
                <CheckIcon />
              </ListItemIcon>
            )}
            <ListItemText>{filter.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
