import { useState, useEffect } from 'react';
// Material UI
import { useTheme, styled } from '@mui/material/styles';

import { windowActionMessage } from '@common/ipc';
import { useApplicationSettings } from '../ApplicationSettingsContext';
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

  const {
    settings: { platform },
  } = useApplicationSettings();

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

  // This should theoretically never change, still a side effect though
  useEffect(() => {
    if (platform === 'linux') {
      document.documentElement.style.setProperty('--title-height', '0px');
    } else {
      document.documentElement.style.setProperty('--title-height', '30px');
    }
  }, [platform]);

  const disabledColor = { color: theme.palette.text.disabled };

  if (platform === 'linux') return null;

  return (
    <StyledHeader>
      <Icon title="logo" width={24} style={{ marginLeft: '10px' }} />
      <StyledDiv sx={focus ? {} : disabledColor}>PowerRenameExt</StyledDiv>
    </StyledHeader>
  );
}

function changeTitlebarIconsColor(color: string): void {
  window.electron.ipcRenderer.sendMessage(
    ...windowActionMessage({ type: 'change-color', icons: color })
  );
}
