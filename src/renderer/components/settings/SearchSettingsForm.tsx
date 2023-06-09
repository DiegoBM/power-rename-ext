import { useState } from 'react';
// Material UI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CheckBox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useDebounceValue } from '@hooks/useDebounceValue';
import FunctionEditorDialog from '@components/functions/FunctionEditorDialog';

// import './SearchSettingsForm.css';

const defaultFunction = `function (search) {\n  // Return a string\n  return 'replace';\n}`;

export type SearchSettings = {
  input: string;
  isRegex: boolean;
  matchesAll: boolean;
  isCaseSensitive: boolean;
  useFunction: boolean;
};

type SearchSettingsFormProps = {
  searchSettings: SearchSettings;
  onSearchChange: (changes: Partial<SearchSettings>) => void;
};

export default function SearchSettingsForm({
  searchSettings,
  onSearchChange,
}: SearchSettingsFormProps): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useDebounceValue(
    searchSettings.input,
    (newValue) => onSearchChange({ input: newValue })
  );

  return (
    <Box
      component="form"
      aria-label="Search Settings"
      noValidate
      autoComplete="off"
      sx={{ flexGrow: searchSettings.useFunction ? 1 : 0 }}
    >
      {searchSettings.useFunction ? (
        <>
          <Button fullWidth onClick={() => setModalOpen(true)}>
            Edit Function
          </Button>
          <FunctionEditorDialog
            open={modalOpen}
            initialValue={searchSettings.input || defaultFunction}
            onClose={() => setModalOpen(false)}
            onValueConfirmed={(newValue) => onSearchChange({ input: newValue })}
          />
        </>
      ) : (
        <TextField
          id="filled-basic"
          // label="Search for"
          fullWidth
          hiddenLabel
          placeholder="Search for"
          variant="filled"
          size="small"
          name="search"
          value={searchInput}
          // sx={{ pb: 1 }}
          onChange={(event) => setSearchInput(event.target.value)}
        />
      )}

      <FormControlLabel
        control={
          <CheckBox
            checked={searchSettings.useFunction}
            onChange={(event) => {
              onSearchChange({
                useFunction: event.target.checked,
                input: '',
              });
              setSearchInput('');
            }}
          />
        }
        label="Use a function"
      />
      {!searchSettings.useFunction && (
        <>
          <FormControlLabel
            control={
              <CheckBox
                checked={searchSettings.isRegex}
                // sx={{ pb: 0.5, pt: 0.5 }}
                onChange={(event) =>
                  onSearchChange({
                    isRegex: event.target.checked,
                  })
                }
              />
            }
            label="Use regular expressions"
          />
          <FormControlLabel
            control={
              <CheckBox
                checked={searchSettings.matchesAll}
                // sx={{ pb: 0.5, pt: 0.5 }}
                onChange={(event) =>
                  onSearchChange({
                    matchesAll: event.target.checked,
                  })
                }
              />
            }
            label="Matches all occurrences"
          />
          <FormControlLabel
            control={
              <CheckBox
                checked={searchSettings.isCaseSensitive}
                // sx={{ pb: 0.5, pt: 0.5 }}
                onChange={(event) =>
                  onSearchChange({
                    isCaseSensitive: event.target.checked,
                  })
                }
              />
            }
            label="Case sensitive"
          />
        </>
      )}
    </Box>
  );
}
