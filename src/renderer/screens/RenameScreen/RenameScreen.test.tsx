import '@mocks/window.mock';
import { asMock } from '@mocks/utils';

import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RenameScreen from './RenameScreen';
import { chooseOption } from '@components/settings/ReplaceSettingsForm.test';
import type { IPCRendererMessage, PathEntry } from '@common/ipc';

const testEntries: PathEntry[] = [
  {
    name: 'test',
    base: 'test.test',
    ext: '.test',
    isDirectory: false,
    basePath: '/',
    fullPath: '/test.test',
  },
  {
    name: 'test2',
    base: 'test2.test',
    ext: '.test',
    isDirectory: false,
    basePath: '/',
    fullPath: '/test2.test',
  },
  {
    name: 'test3',
    base: 'test3.test',
    ext: '.test',
    isDirectory: false,
    basePath: '/',
    fullPath: '/test3.test',
  },
  {
    name: 'folder',
    base: 'folder',
    ext: '',
    isDirectory: true,
    basePath: '/',
    fullPath: '/folder',
    subEntries: [
      {
        name: 'test4',
        base: 'test4.test',
        ext: '.test',
        isDirectory: false,
        basePath: '/folder',
        fullPath: '/folder/test4.test',
      },
      {
        name: 'test5',
        base: 'test5.test',
        ext: '.test',
        isDirectory: false,
        basePath: '/folder',
        fullPath: '/folder/test5.test',
      },
    ],
  },
];

describe('RenameScreen', () => {
  it('should render the title bar, the settgins forms, the grid and the apply button', () => {
    render(<RenameScreen />);

    expect(screen.queryByText(/PowerRenameExt/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('form', { name: /search settings/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('form', { name: /replace settings/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: /split button/i })
    ).toBeInTheDocument();
  });

  it('should render the rows returned by the main process', () => {
    renderWithData(() => {
      expect(screen.queryByText(/no records to display/i)).toBeInTheDocument();
    });

    // The header is also a row
    expect(screen.queryAllByRole('row')).toHaveLength(7);
  });

  it('should disable the apply button until at least one row with a rename is checked', async () => {
    renderWithData(() => {
      expect(
        screen.queryByRole('group', { name: /split button/i })
      ).toHaveAttribute('aria-disabled', 'true');
    });

    await prepareApplicableRename(0);

    expect(
      screen.queryByRole('group', { name: /split button/i })
    ).toHaveAttribute('aria-disabled', 'true');

    await prepareApplicableRename(1);

    expect(
      screen.queryByRole('group', { name: /split button/i })
    ).toHaveAttribute('aria-disabled', 'false');
  });

  it('should notify the main process with the entries to rename', async () => {
    renderWithData(() => {
      expect(window.electron.ipcRenderer.sendMessage).not.toHaveBeenCalledWith(
        'ipc-communication',
        expect.objectContaining({ type: 'process-renames' })
      );
    });

    await prepareApplicableRename(1);
    await userEvent.click(screen.getByText(/apply/i, { selector: 'button' }));

    expect(window.electron.ipcRenderer.sendMessage).toHaveBeenLastCalledWith(
      'ipc-communication',
      {
        type: 'process-renames',
        payload: [
          {
            isDirectory: false,
            basePath: '/',
            from: 'test2.test',
            to: 'test_2.test',
          },
        ],
      }
    );
  });

  it('should ignore files when the relevant option is unchecked', async () => {
    renderWithData();

    await userEvent.type(screen.getByPlaceholderText(/search for/i), 'test2');
    await userEvent.type(
      screen.getByPlaceholderText(/replace with/i),
      'test_2'
    );
    await waitFor(async () => {
      expect(screen.queryByText(/test_2.test/i)).toBeInTheDocument();
    });

    const includeFiles = screen.getByRole('button', {
      name: /include files/i,
      pressed: true,
    });
    await userEvent.click(includeFiles);
    await waitFor(async () => {
      expect(screen.queryByText(/test_2.test/i)).not.toBeInTheDocument();
    });
  });

  it('should ignore folders when the relevant option is unchecked', async () => {
    renderWithData();

    await userEvent.type(screen.getByPlaceholderText(/search for/i), 'folder');
    await userEvent.type(
      screen.getByPlaceholderText(/replace with/i),
      'fol_der'
    );
    await waitFor(async () => {
      expect(screen.queryByText(/fol_der/i)).toBeInTheDocument();
    });

    const includeFiles = screen.getByRole('button', {
      name: /include folders/i,
      pressed: true,
    });
    await userEvent.click(includeFiles);
    await waitFor(async () => {
      expect(screen.queryByText(/fol_der/i)).not.toBeInTheDocument();
    });
  });

  it('should ignore files in subfolders when the relevant option is unchecked', async () => {
    renderWithData();

    await userEvent.type(screen.getByPlaceholderText(/search for/i), 'test4');
    await userEvent.type(
      screen.getByPlaceholderText(/replace with/i),
      'test_4'
    );
    await waitFor(async () => {
      expect(screen.queryByText(/test_4.test/i)).toBeInTheDocument();
    });

    const includeFiles = screen.getByRole('button', {
      name: /include subfolders/i,
      pressed: true,
    });
    await userEvent.click(includeFiles);
    await waitFor(async () => {
      expect(screen.queryByText(/test_4.test/i)).not.toBeInTheDocument();
    });
  });

  it('should apply the transformation both to the filename and the extension when the default option is selected', async () => {
    renderWithData();

    // Filename + extension is the default option
    await prepareRename('test', 'te_st');
    await waitFor(() => {
      expect(screen.queryByText(/te_st.te_st/i)).toBeInTheDocument();
    });
  });

  it('should apply the transformation to the filename only when the relevant option is selected', async () => {
    renderWithData();

    await prepareRename('test', 'te_st');
    await waitFor(() => {
      expect(screen.queryByText(/te_st.te_st/i)).toBeInTheDocument();
    });
    await chooseOption(1);
    await waitFor(() => {
      expect(
        screen.queryByText(/filename only/i, { selector: 'div' })
      ).toBeInTheDocument();
      expect(screen.queryByText(/test.test/i)).toBeInTheDocument();
    });
  });

  it('should apply the transformation to the extension only when the relevant option is selected', async () => {
    renderWithData();

    await prepareRename('test', 'te_st');
    await waitFor(() => {
      expect(screen.queryByText(/te_st.te_st/i)).toBeInTheDocument();
    });
    await chooseOption(2);
    await waitFor(() => {
      expect(
        screen.queryByText(/extension only/i, { selector: 'div' })
      ).toBeInTheDocument();
      expect(screen.queryByText(/test.te_st/i)).toBeInTheDocument();
    });
  });

  it('should display the errors dialog when the some of the renames fail', async () => {
    let handler: (message: IPCRendererMessage) => void;
    asMock(window.electron.ipcRenderer.on).mockImplementation((_, fn) => {
      handler = fn;
    });

    render(<RenameScreen />);

    expect(
      screen.queryByRole('dialog', { name: 'Errors in the rename operations' })
    ).not.toBeInTheDocument();

    act(() =>
      handler({
        type: 'rename-results',
        payload: { results: [], success: false },
      })
    );

    expect(
      screen.queryByRole('dialog', { name: 'Errors in the rename operations' })
    ).toBeInTheDocument();
  });
});

// Helper functions
function renderWithData(check?: Function) {
  let handler: (message: IPCRendererMessage) => void;
  asMock(window.electron.ipcRenderer.on).mockImplementation((_, fn) => {
    handler = fn;
  });

  render(<RenameScreen />);

  if (typeof check === 'function') {
    check();
  }

  act(() =>
    handler({
      type: 'scan-results',
      payload: { scanPaths: ['/'], pathEntries: testEntries },
    })
  );
}

async function prepareRename(search: string, replace: string) {
  const searchInput = screen.getByPlaceholderText(/search for/i);
  const replaceInput = screen.getByPlaceholderText(/replace with/i);
  await userEvent.clear(searchInput);
  await userEvent.clear(replaceInput);
  await userEvent.type(searchInput, search);
  await userEvent.type(replaceInput, replace);
}

async function prepareApplicableRename(index: number) {
  await prepareRename('test2', 'test_2');

  await waitFor(() => {
    expect(screen.queryByText(/test_2.test/i)).toBeInTheDocument();
  });

  const checkboxes = screen.getAllByRole('checkbox', {
    name: /Toggle select row/i,
  });

  await userEvent.click(checkboxes[index]);
}
