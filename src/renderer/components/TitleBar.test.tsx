// NOTE: it wont fail without an application settings context provider because
// the context has a default value. Which is a legit behavior
// https://github.com/facebook/react/issues/20003#issuecomment-806089507
import '@mocks/window.mock';
import { asMock } from '@mocks/utils';
// asMock(window.electron.ipcRenderer.platform).mockReturnValueOnce('win32');

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';

import TitleBar from '@components/TitleBar';

describe('TitleBar', () => {
  beforeEach(() => {
    asMock(window.electron.ipcRenderer.sendMessage).mockReset();
  });

  it('should render the title bar', () => {
    render(<TitleBar />);

    expect(screen.queryByRole('img', { name: /logo/i })).toBeInTheDocument();
    expect(screen.queryByText(/PowerRenameExt/i)).toBeInTheDocument();
  });

  it('should Communicate the main process about the change of color when the window loses focus', () => {
    const sendMessage = asMock(window.electron.ipcRenderer.sendMessage);
    render(<TitleBar />);

    // It's called once upon first render to set the theme
    expect(sendMessage).toHaveBeenCalledTimes(1);
    fireEvent.blur(window);
    expect(sendMessage).toHaveBeenCalledTimes(2);
    expect(sendMessage).toHaveBeenLastCalledWith(
      'ipc-communication',
      expect.objectContaining({
        type: 'window-action',
        payload: expect.objectContaining({ type: 'change-color' }),
      })
    );

    fireEvent.focus(window);
    expect(sendMessage).toHaveBeenCalledTimes(3);
    expect(sendMessage).toHaveBeenLastCalledWith(
      'ipc-communication',
      expect.objectContaining({
        type: 'window-action',
        payload: expect.objectContaining({ type: 'change-color' }),
      })
    );
  });

  it('should Communicate the main process about the change of color when the theme changes', () => {
    const sendMessage = asMock(window.electron.ipcRenderer.sendMessage);
    const light = createTheme({ palette: { mode: 'light' } });
    const dark = createTheme({ palette: { mode: 'dark' } });
    const { rerender } = render(
      <ThemeProvider theme={light}>
        <TitleBar />
      </ThemeProvider>
    );
    expect(sendMessage).toHaveBeenCalledTimes(1);

    rerender(
      <ThemeProvider theme={dark}>
        <TitleBar />
      </ThemeProvider>
    );
    expect(sendMessage).toHaveBeenCalledTimes(2);
    expect(sendMessage).toHaveBeenLastCalledWith(
      'ipc-communication',
      expect.objectContaining({
        type: 'window-action',
        payload: expect.objectContaining({ type: 'change-color' }),
      })
    );
  });
});

// function Wrapper({
//   children,
//   mode,
// }: {
//   children: ReactElement;
//   mode: 'dark' | 'light';
// }) {
//   // function Wrapper(children: ReactElement): ReactElement<any, any> | null {
//   const theme = createTheme({ palette: { mode } });
//   return (
//     <ApplicationSettingsProvider>
//       <ThemeProvider theme={theme}>{children}</ThemeProvider>
//     </ApplicationSettingsProvider>
//   );
// }

// type PaletteMode = 'dark' | 'light';

// function renderWrapped(mode: PaletteMode = 'light') {
//   const Wrapper = ({ children }: { children: ReactNode }) => {
//     const theme = createTheme({ palette: { mode } });

//     return (
//       <ApplicationSettingsProvider>
//         <ThemeProvider theme={theme}>{children}</ThemeProvider>
//       </ApplicationSettingsProvider>
//     );
//   };

//   return render(<TitleBar />, { wrapper: Wrapper });
// }
