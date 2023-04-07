import { useState } from 'react';
// Material UI
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
// Syntax Highlighter
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { autocomplete } from './autocomplete';

type onCloseReason =
  | 'backdropClick'
  | 'escapeKeyDown'
  | 'cancelButton'
  | 'confirmButton';

type FunctionEditorDialogProps = {
  open: boolean;
  initialValue: string;
  onClose: (event: {}, reason: onCloseReason) => void;
  onValueConfirmed: (newValue: string) => void;
};

const completions = [
  {
    label: 'fileInFolderIndex',
    type: 'property',
    detail: 'number',
    info: 'Global index of the current item across the entire processing',
  },
  {
    label: 'globalIndex',
    type: 'property',
    detail: 'number',
    info: 'Index of the current entry within its containing folder, as found when the directory was read.\nNote that only files will receive this type of index',
  },
  {
    label: 'isFolder',
    type: 'property',
    detail: 'boolean',
    info: 'Indicates whether the current entry is a folder or not',
  },
  {
    label: 'stats',
    type: 'property',
    detail: 'Stats',
    info: 'The `Stats` object of the current entry as returned by the node.js `stat` function.',
  },
];

export default function FunctionEditorDialog({
  open,
  onClose,
  initialValue,
  onValueConfirmed,
}: FunctionEditorDialogProps) {
  const [code, setCode] = useState(initialValue);
  const theme = useTheme();

  const handleCancel = (event: {}, reason: onCloseReason) => {
    onClose(event, reason);
    setCode(initialValue);
  };

  const handleConfirm = (event: {}) => {
    onValueConfirmed(code);
    onClose(event, 'confirmButton');
  };

  return (
    <Dialog maxWidth="md" fullWidth open={open} onClose={handleCancel}>
      <DialogTitle>Please type a JavaScript function</DialogTitle>
      <DialogContent>
        <CodeMirror
          value={code}
          style={{ height: '100%' }}
          height="100%"
          theme={theme.palette.mode}
          extensions={[javascript({ jsx: true }), autocomplete(completions)]}
          onChange={(value) => setCode(value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={(event) => handleCancel(event, 'cancelButton')}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
