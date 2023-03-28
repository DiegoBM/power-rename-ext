import { useState } from 'react';
// Material UI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CheckBox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import Stack from '@mui/material/Stack';
// Icons
import FolderIcon from '@mui/icons-material/FolderOutlined';
import FileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { createSvgIcon } from '@mui/material';

import FunctionEditorDialog from './FunctionEditorDialog';

const IncludeSubfoldersIcon = createSvgIcon(
  <path d="m 4.1898913,13.280198 -2.047202,-2.047201 0.8154108,-0.815412 1.2260078,1.226009 2.4520157,-2.4520179 0.8154107,0.8154129 z m 0,-5.3719077 L 2.1426893,5.8610888 2.9581001,5.0456779 4.1841079,6.2716858 6.6361236,3.8196702 7.4515343,4.6350811 Z m 2.9950115,8.1071147 0.8154108,-0.815409 1.4978122,1.49781 1.4978112,-1.49781 0.81541,0.815409 -1.497811,1.497812 1.497811,1.497811 -0.81541,0.815411 L 9.4981258,18.328628 8.0003136,19.826439 7.1849028,19.011028 8.682715,17.513217 Z M 9.7765101,4.6887269 H 21.71745 V 7.0392336 H 9.7765101 Z m 0,5.8246191 H 21.71745 v 2.350506 H 9.7765101 Z m 4.6745419,5.824618 h 7.266398 v 2.350506 h -7.266398 z" />,
  'IncludeSubfolders'
);

import { useDebounceValue } from '@hooks/useDebounceValue';

const defaultFunction = 'function (...args) {\n\treturn args[0];\n}';

type FormatType = 'lowercase' | 'uppercase' | 'titlecase' | 'capitalize' | null;
type Scope = 'base' | 'name' | 'ext';

export type ReplaceSettings = {
  input: string;
  useFunction: boolean;
  includeFiles: boolean;
  includeFolders: boolean;
  includeSubfolders: boolean;
  formatType: FormatType;
  scope: Scope;
};

type ReplaceSettingsFormProps = {
  replaceSettings: ReplaceSettings;
  onReplaceChange: (newReplaceSettings: ReplaceSettings) => void;
};

export default function ReplaceSettingsForm({
  replaceSettings,
  onReplaceChange,
}: ReplaceSettingsFormProps): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);

  const [replaceInput, setReplaceInput] = useDebounceValue('', (newValue) =>
    // settingsDispatch({ type: 'inputChange', payload: newValue })
    onReplaceChange({ ...replaceSettings, input: newValue })
  );

  return (
    <Box component="form" sx={{ flexGrow: 1 }} noValidate autoComplete="off">
      {replaceSettings.useFunction ? (
        <>
          <Button fullWidth onClick={() => setModalOpen(true)}>
            Edit Function
          </Button>
          <FunctionEditorDialog
            open={modalOpen}
            initialValue={replaceSettings.input || defaultFunction}
            onClose={() => setModalOpen(false)}
            onValueConfirmed={(newValue) =>
              onReplaceChange({ ...replaceSettings, input: newValue })
            }
          />
        </>
      ) : (
        <TextField
          id="filled-basic"
          hiddenLabel
          fullWidth
          placeholder="Replace with"
          variant="filled"
          size="small"
          name="replace"
          value={replaceInput}
          onChange={(event) => setReplaceInput(event.target.value)}
        />
      )}
      <FormControlLabel
        control={
          <CheckBox
            checked={replaceSettings.useFunction}
            onChange={(event) => {
              onReplaceChange({
                ...replaceSettings,
                useFunction: event.target.checked,
                input: '',
              });
              setReplaceInput('');
            }}
          />
        }
        label="Use a replace function"
      />
      <Stack direction="row" spacing={1}>
        <FormControl variant="standard" size="small" fullWidth>
          <InputLabel id="replace-scope-select-label">Apply to</InputLabel>
          <Select
            labelId="replace-scope-select-label"
            id="replace-scope-select"
            value={replaceSettings.scope}
            label="Apply to"
            onChange={(event) =>
              onReplaceChange({
                ...replaceSettings,
                scope: event.target.value as Scope,
              })
            }
          >
            <MenuItem value="base">Filename + extension</MenuItem>
            <MenuItem value="name">Filename only</MenuItem>
            <MenuItem value="ext">Extension only</MenuItem>
          </Select>
        </FormControl>
        <Divider orientation="vertical" flexItem />
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Include files">
            <ToggleButton
              color="primary"
              size="small"
              value="check"
              selected={replaceSettings.includeFiles}
              onChange={() =>
                onReplaceChange({
                  ...replaceSettings,
                  includeFiles: !replaceSettings.includeFiles,
                })
              }
            >
              <FileIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Include folders">
            <ToggleButton
              color="primary"
              size="small"
              value="check"
              selected={replaceSettings.includeFolders}
              onChange={() =>
                onReplaceChange({
                  ...replaceSettings,
                  includeFolders: !replaceSettings.includeFolders,
                })
              }
            >
              <FolderIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Include subfolders">
            <ToggleButton
              color="primary"
              size="small"
              value="check"
              selected={replaceSettings.includeSubfolders}
              onChange={() =>
                onReplaceChange({
                  ...replaceSettings,
                  includeSubfolders: !replaceSettings.includeSubfolders,
                })
              }
            >
              <IncludeSubfoldersIcon />
            </ToggleButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}
