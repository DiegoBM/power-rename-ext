import '@mocks/window.mock';
import { asMock } from '@mocks/utils';

import { render } from '@testing-library/react';
import { useTheme } from '@mui/material/styles';

import App from './App';
import RenameScreen from '@screens/RenameScreen/RenameScreen';
import useMediaQuery from '@mui/material/useMediaQuery';

jest.mock('@screens/RenameScreen/RenameScreen');
jest.mock('@mui/material/useMediaQuery');

describe('App', () => {
  test('renders the RenameScreen', () => {
    // At the moment App.tsx is little less than a container for providers
    // Not much to test here for now
    render(<App />);

    expect(RenameScreen).toHaveBeenCalled();
  });

  test('adjusts the theme to the machine theme settings', () => {
    let mode;
    asMock(RenameScreen).mockImplementation(() => {
      const theme = useTheme();
      mode = theme.palette.mode;

      return null;
    });

    asMock(useMediaQuery)
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => false);

    render(<App />);
    expect(mode).toBe('dark');

    render(<App />);
    expect(mode).toBe('light');
  });
});
