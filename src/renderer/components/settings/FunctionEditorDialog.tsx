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

type onCloseReason =
  | 'backdropClick'
  | 'escapeKeyDown'
  | 'rejectButton'
  | 'confirmButton';

type FunctionEditorDialogProps = {
  open: boolean;
  initialValue: string;
  onClose: (event: {}, reason: onCloseReason) => void;
  onValueConfirmed: (newValue: string) => void;
};

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
          extensions={[javascript({ jsx: true })]}
          onChange={(value) => setCode(value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={(event) => handleCancel(event, 'rejectButton')}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
