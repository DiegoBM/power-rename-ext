// Note: we are only testing our external interface. We won't be testing MUI
// or MUI React Table or any other libraries functionality (like expand/collapse,
// select-all, etc), since they are supposed to be tested and working
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Grid from '@components/grid/Grid';
import type { RenameEntry } from '@common/ipc';

const testEntries: RenameEntry[] = [
  {
    name: 'test',
    base: 'test.test',
    ext: '.test',
    isDirectory: false,
    basePath: '/',
    fullPath: '/test.test',
    rename: '',
  },
  {
    name: 'test2',
    base: 'test2.test',
    ext: '.test',
    isDirectory: false,
    basePath: '/',
    fullPath: '/test2.test',
    rename: 'test_2.test',
  },
  {
    name: 'test3',
    base: 'test3.test',
    ext: '.test',
    isDirectory: false,
    basePath: '/',
    fullPath: '/test3.test',
    rename: '',
  },
  {
    name: 'folder',
    base: 'folder',
    ext: '',
    isDirectory: true,
    basePath: '/',
    fullPath: '/folder',
    rename: '',
    subEntries: [
      {
        name: 'test4',
        base: 'test4.test',
        ext: '.test',
        isDirectory: false,
        basePath: '/folder',
        fullPath: '/folder/test4.test',
        rename: '',
      },
      {
        name: 'test5',
        base: 'test5.test',
        ext: '.test',
        isDirectory: false,
        basePath: '/folder',
        fullPath: '/folder/test5.test',
        rename: 'test_5.test',
      },
    ],
  },
];

describe('Grid', () => {
  test('renders an empty grid', () => {
    render(
      <Grid entries={[]} onRowSelectionChange={() => {}} rowSelection={{}} />
    );

    expect(screen.queryByText(/original \(0\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/renamed \(0\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/no records to display/i)).toBeInTheDocument();
  });

  test('renders as many rows as entries passed to the "entries" prop', () => {
    render(
      <Grid
        entries={testEntries}
        onRowSelectionChange={() => {}}
        rowSelection={{}}
      />
    );

    // The header is also a row
    expect(screen.queryAllByRole('row')).toHaveLength(7);
  });

  test('displays the right number of total entries and entries to be renamed', () => {
    render(
      <Grid
        entries={testEntries}
        onRowSelectionChange={() => {}}
        rowSelection={{}}
      />
    );

    expect(screen.queryByText(/original \(6\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/renamed \(2\)/i)).toBeInTheDocument();
  });

  test('takes the selection information from "rowSelection" prop', () => {
    const { rerender } = render(
      <Grid
        entries={testEntries}
        onRowSelectionChange={() => {}}
        rowSelection={{}}
      />
    );
    expect(screen.queryAllByRole('checkbox', { checked: true })).toHaveLength(
      0
    );

    rerender(
      <Grid
        entries={testEntries}
        onRowSelectionChange={() => {}}
        rowSelection={{ '/test.test': true }}
      />
    );
    expect(screen.queryAllByRole('checkbox', { checked: true })).toHaveLength(
      1
    );
  });

  test('notifies the parent when the user selects a row', async () => {
    const handleRowSelectionChange = jest.fn();

    render(
      <Grid
        entries={testEntries}
        onRowSelectionChange={handleRowSelectionChange}
        rowSelection={{}}
      />
    );

    expect(handleRowSelectionChange).toHaveBeenCalledTimes(0);
    await userEvent.click(
      screen.getAllByRole('checkbox', { checked: false })[1]
    );
    expect(handleRowSelectionChange).toHaveBeenCalledTimes(1);
  });

  test('allows filtering to display only the entries that will be modified (and their containing folders)', async () => {
    render(
      <Grid
        entries={testEntries}
        onRowSelectionChange={() => {}}
        rowSelection={{}}
      />
    );

    // The header is also a row
    expect(screen.queryAllByRole('row')).toHaveLength(7);
    await chooseFilter(1);
    const rows = screen.getAllByRole('row');
    expect(screen.queryAllByRole('row')).toHaveLength(4);
  });
});

async function chooseFilter(index: number): Promise<void> {
  if (index < 0) return;

  await userEvent.click(screen.getByRole('button', { name: /filter/i }));
  const options = screen.getAllByRole('menuitem');

  if (index >= options.length) return;

  await userEvent.click(options[index]);
}
