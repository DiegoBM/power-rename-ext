// Material UI
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import SearchSettingsForm, { type SearchSettings } from './SearchSettingsForm';
import ReplaceSettingsForm, {
  type ReplaceSettings,
} from './ReplaceSettingsForm';

export type { SearchSettings } from './SearchSettingsForm';
export type { ReplaceSettings } from './ReplaceSettingsForm';

type SettingsFormProps = {
  searchSettings: SearchSettings;
  replaceSettings: ReplaceSettings;
  onSearchChange: (newSearchSettings: SearchSettings) => void;
  onReplaceChange: (newReplaceSettings: ReplaceSettings) => void;
};

export default function SettingsForm({
  searchSettings,
  replaceSettings,
  onSearchChange,
  onReplaceChange,
}: SettingsFormProps): JSX.Element {
  return (
    <Stack gap={2} sx={{ height: '100%' }} justifyContent="space-between">
      <SearchSettingsForm
        searchSettings={searchSettings}
        onSearchChange={onSearchChange}
      />
      <Divider variant="middle" />
      {!searchSettings.useFunction && (
        <>
          <ReplaceSettingsForm
            replaceSettings={replaceSettings}
            onReplaceChange={onReplaceChange}
          />
          <Divider variant="middle" />
        </>
      )}
    </Stack>
  );
}
