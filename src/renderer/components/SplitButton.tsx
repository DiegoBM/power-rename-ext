import { useState, useRef, type MouseEvent as ReactMouseEvent } from 'react';
// Material UI
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import type { SxProps, Theme } from '@mui/material';

export type SplitButtonOption = { label: string; value: string };

type SplitButtonProps = {
  options: SplitButtonOption[];
  current: SplitButtonOption;
  onButtonClick: (option: SplitButtonOption) => void;
  onOptionSelect: (option: SplitButtonOption) => void;
  clickOnSelect?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme> | undefined;
};

export default function SplitButton({
  options,
  current,
  onButtonClick,
  onOptionSelect,
  sx,
  clickOnSelect = true,
  disabled = false,
}: SplitButtonProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleMenuItemClick = (option: SplitButtonOption): void => {
    onOptionSelect(option);
    setOpen(false);
    if (clickOnSelect) {
      onButtonClick(option);
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event): void => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup
        sx={sx}
        variant="contained"
        ref={anchorRef}
        aria-label="split button"
        disabled={disabled}
        aria-disabled={disabled}
      >
        <Button onClick={() => onButtonClick(current)}>{current.label}</Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option.value}
                      // disabled={index === 2}
                      selected={option.value === current.value}
                      onClick={() => handleMenuItemClick(option)}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
