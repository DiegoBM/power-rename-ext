import { useState, useEffect } from 'react';
// Material UI
import { useTheme, styled } from '@mui/material/styles';

import { windowActionMessage } from '@common/ipc';
import Icon from '@assets/Icon';

const StyledHeader = styled('header')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  height: 'var(--title-height)',
  width: 'calc(100% - 2px)' /*Compensate for body 1px border*/,
  display: 'flex',
  alignItems: 'center',
  WebkitAppRegion: 'drag',
}));

const StyledDiv = styled('div')({
  fontSize: '0.8rem',
  marginLeft: '10px',
});

export default function TitleBar() {
  const [focus, setFocus] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const handleFocus = () => {
      changeTitlebarIconsColor(theme.palette.text.primary);
      setFocus(true);
    };

    const handleBlur = () => {
      changeTitlebarIconsColor(theme.palette.text.disabled);
      setFocus(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [theme]);

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage(
      ...windowActionMessage({
        type: 'change-color',
        icons: theme.palette.text.primary,
        background: theme.palette.background.paper,
      })
    );
  }, [theme]);

  const disabledColor = { color: theme.palette.text.disabled };

  return (
    <StyledHeader>
      <Icon width={24} style={{ marginLeft: '10px' }} />
      <StyledDiv sx={focus ? {} : disabledColor}>PowerRenameEx</StyledDiv>
    </StyledHeader>
  );
}

function changeTitlebarIconsColor(color: string): void {
  window.electron.ipcRenderer.sendMessage(
    ...windowActionMessage({ type: 'change-color', icons: color })
  );
}
