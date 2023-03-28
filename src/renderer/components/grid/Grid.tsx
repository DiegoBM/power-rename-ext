import { useMemo, useState } from 'react';
// Material UI
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
// Icons
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FileIcon from '@mui/icons-material/InsertDriveFileTwoTone';
// Material React Table
import MaterialReactTable, {
  type MRT_RowSelectionState,
  type MRT_ColumnDef,
  type MRT_Row,
} from 'material-react-table';

import { RenameEntry } from '@common/ipc';
import FilterMenu, { type Filter, type FilterValue } from './FilterMenu';

import './Grid.css';

const expandRowOptions = {
  sx: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'min-content',
    minWidth: 'min-content',
    paddingTop: '0.5rem',
  },
};

const fixedHeader = {
  padding: 0,
  paddingTop: '0.50rem',
  paddingLeft: '10px',
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: '40px',
  minWidth: '40px',
};

const customHeader = {
  flex: '1 0 180px',
  padding: '0',
  paddingTop: '0',
  paddingBottom: '0',
  justifyContent: 'center',
};

const selectRowOptions = {
  head: { sx: fixedHeader },
  body: {
    sx: {
      paddingLeft: '15px',
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: '40px',
      minWidth: '40px',
    },
  },
};

const filters: Filter[] = [
  { label: 'Show all files', value: 'show-all-files' },
  {
    label: 'Only show files that will be renamed',
    value: 'show-renamed-files',
  },
];

type GridProps = {
  entries: RenameEntry[];
  rowSelection: MRT_RowSelectionState;
  onRowSelectionChange: React.Dispatch<
    React.SetStateAction<MRT_RowSelectionState>
  >;
};

export default function Grid({
  entries,
  rowSelection,
  onRowSelectionChange,
}: GridProps): JSX.Element {
  console.log('rendering Grid');
  const [currentFilter, setCurrentFilter] =
    useState<FilterValue>('show-all-files');

  const [data, total, renames] = useMemo(() => {
    return filterItems(entries, currentFilter);
  }, [entries, currentFilter]);

  const columns = useMemo<MRT_ColumnDef<RenameEntry>[]>(
    () => [
      {
        header: '',
        accessorKey: 'isDirectory',
        size: 40,
        muiTableHeadCellProps: { sx: fixedHeader },
        muiTableBodyCellProps: { sx: { flexGrow: 0, flexShrink: 0 } },
        Header: () => <FileIcon />,
        Cell: (data) => (
          <FileIconCell
            isFolder={data.cell.getValue<boolean>()}
            isExpanded={data.row.getIsExpanded()}
          />
        ),
      },
      {
        header: 'Original',
        accessorKey: 'base',
        Header: (
          <Box sx={{ padding: '0.5rem 1rem' }}>{`Original (${total})`}</Box>
        ),
        Cell: ({ cell }) => <ResultCell value={cell.getValue<string>()} />,
        muiTableHeadCellProps: {
          sx: customHeader,
        },
      },
      {
        header: 'Renamed',
        accessorKey: 'rename',
        muiTableHeadCellProps: {
          sx: {
            ...customHeader,
            '& div:not(.flex-center)': { width: '100%', display: 'block' },
          },
        },
        Header: ({ column }) => (
          <Box className="flex-center">
            {`Renamed (${renames})`}
            <FilterMenu
              filters={filters}
              currentFilter={currentFilter}
              onFilterClick={setCurrentFilter}
            />
          </Box>
        ),
        Cell: ({ cell }) => (
          <ResultCell value={cell.getValue<string>()} rename />
        ),
      },
    ],
    [total, renames, currentFilter]
  );

  const isVirtual = data.length >= 100;

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableStickyHeader
      enableTopToolbar={false}
      enableBottomToolbar={false}
      enableSubRowSelection={false}
      enableSorting={false}
      enableColumnActions={false}
      enableColumnOrdering={false}
      enableGlobalFilter={false}
      enablePagination={false}
      enableRowVirtualization={isVirtual}
      // If the length of the array changes recreate the table. This should fix
      // the bug in material-react-table when switching from virtualized to
      // non-virtualized conditionally
      key={data.length}
      rowVirtualizerProps={{ overscan: 3, estimateSize: () => 32 }} //{{ overscan: 10 }}
      enableRowSelection={true}
      onRowSelectionChange={onRowSelectionChange}
      state={{ rowSelection }}
      enableExpanding
      enableExpandAll
      initialState={{ expanded: true }}
      getRowId={(originalRow) => originalRow.fullPath}
      getSubRows={(originalRow) => originalRow.subEntries}
      displayColumnDefOptions={{
        'mrt-row-expand': {
          muiTableHeadCellProps: expandRowOptions,
          muiTableBodyCellProps: expandRowOptions,
        },
        'mrt-row-select': {
          muiTableHeadCellProps: selectRowOptions.head,
          muiTableBodyCellProps: selectRowOptions.body,
        },
      }}
      layoutMode="grid"
      muiTableHeadRowProps={{ sx: { height: '2.5rem' } }}
      muiTableHeadCellProps={{
        sx: { paddingTop: '0.5rem', backgroundColor: 'red' },
      }}
      muiTableBodyRowProps={getRowProps}
      muiTableContainerProps={{
        sx: { maxHeight: 'var(--grid-height)' },
      }}
    />
  );
}

function getRowProps({ row }: { row: MRT_Row<RenameEntry> }) {
  const selectable = row.getIsSelected() && row.original.rename != null;

  return { sx: { height: '2.1rem' }, selected: selectable };
}

// Cell type components used only in this Componen
type ResultCellProps = { value: string; rename?: boolean };

function ResultCell({ value, rename }: ResultCellProps): JSX.Element {
  const { palette } = useTheme();
  const classes = `truncate result ${palette.mode}${rename ? ' rename' : ''}`;
  value = value && rename ? value.replace(/ /g, '\u00a0') : value;

  return <span className={classes}>{value}</span>;
}

type FileIconCellProps = {
  isFolder: boolean;
  isExpanded: boolean;
};

function FileIconCell({
  isFolder,
  isExpanded,
}: FileIconCellProps): JSX.Element {
  return isFolder ? (
    isExpanded ? (
      <FolderOpenIcon />
    ) : (
      <FolderIcon />
    )
  ) : (
    <FileIcon />
  );
}

// Helper functions
// Filter implementation
function filterItems(
  entries: RenameEntry[],
  filter: FilterValue
): [RenameEntry[], number, number] {
  const result: [RenameEntry[], number, number] = [[], 0, 0];

  entries.forEach((entry) => {
    const [subEntries, total, renamed] = filterItems(
      entry.subEntries ?? [],
      filter
    );
    result[1] += total + 1;
    if (filter === 'show-renamed-files' && !entry.rename && !subEntries.length)
      return result;

    result[2] += renamed + (entry.rename ? 1 : 0);
    result[0].push({ ...entry, subEntries });
  });

  return result;
}
