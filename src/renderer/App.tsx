import { useMemo } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// Material UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

import RenameScreen from '@screens/RenameScreen/RenameScreen';
import ApplicationSettingsProvider from './ApplicationSettingsContext';

import './App.css';

export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ApplicationSettingsProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<RenameScreen />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ApplicationSettingsProvider>
  );
}
