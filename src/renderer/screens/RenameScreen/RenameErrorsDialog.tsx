import { useMemo } from 'react';
// Material UI
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
// Material React Table
import MaterialReactTable, { type MRT_ColumnDef } from 'material-react-table';

import { RenameResult } from '@common/ipc';

type onCloseReason = 'backdropClick' | 'escapeKeyDown' | 'confirmButton';

type RenameResultsDialogProps = {
  open: boolean;
  results: RenameResult[];
  onClose: (event: {}, reason: onCloseReason) => void;
  onValueConfirmed: () => void;
  forceConfirm?: boolean;
};

export default function RenameErrorsDialog({
  open,
  results,
  onClose,
  onValueConfirmed,
  forceConfirm = false,
}: RenameResultsDialogProps) {
  const handleCancel = (event: {}, reason: onCloseReason) => {
    onClose(event, reason);
  };

  const handleConfirm = (event: {}) => {
    onValueConfirmed();
    onClose(event, 'confirmButton');
  };

  const data = useMemo<RenameResult[]>(
    () => results.filter((result) => !result.success),
    [results]
  );

  const columns = useMemo<MRT_ColumnDef<RenameResult>[]>(
    () => [
      { header: 'Original', accessorKey: 'fromPath' },
      { header: 'Rename', accessorKey: 'toPath' },
      { header: 'Error', accessorKey: 'error', minSize: 700 },
    ],
    []
  );

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      open={open}
      onClose={forceConfirm ? undefined : handleCancel}
    >
      <DialogTitle>Errors in the rename operations</DialogTitle>
      <DialogContent>
        <MaterialReactTable
          columns={columns}
          data={data}
          key={results.length}
          enableRowVirtualization={results.length > 200}
          enablePagination={false}
          enableStickyHeader
          enableTopToolbar={false}
          enableBottomToolbar={false}
          enableSorting={false}
          enableColumnActions={false}
          enableColumnOrdering={false}
          enableGlobalFilter={false}
          enableColumnResizing={true}
          layoutMode="grid"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirm} autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
