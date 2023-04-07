import '@mocks/window.mock';
import { asMock } from '@mocks/utils';

// import type { ReactNode, ReactElement, JSXElementConstructor } from 'react';
import { render, screen } from '@testing-library/react';
import { useTheme } from '@mui/material/styles';
// import userEvent from '@testing-library/user-event'
import App from './App';
import RenameScreen from '@screens/RenameScreen/RenameScreen';
import useMediaQuery from '@mui/material/useMediaQuery';

jest.mock('@screens/RenameScreen/RenameScreen');
jest.mock('@mui/material/useMediaQuery');

// import ApplicationSettingsProvider, {
//   ApplicationSettings,
// } from 'renderer/ApplicationSettingsContext';

// type renderWithApplicationSettingsOptions = {
//   initialSettings: ApplicationSettings;
//   [option: string]: unknown;
// };
// function renderWithApplicationSettings(
//   ui: ReactElement<any, string | JSXElementConstructor<any>>,
//   { initialSettings, ...options }: renderWithApplicationSettingsOptions
// ) {
//   const Wrapper = ({ children }: { children: ReactNode }) => (
//     <ApplicationSettingsProvider initialSettings={initialSettings}>
//       {children}
//     </ApplicationSettingsProvider>
//   );
//   return render(ui, { wrapper: Wrapper, ...options });
// }

describe('App', () => {
  it('should render the RenameScreen', () => {
    // At the moment App.tsx is little less than a container for providers
    // Not much to test here for now
    render(<App />);

    expect(RenameScreen).toHaveBeenCalled();
  });

  it('should adjust the theme to the machine theme settings', () => {
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
