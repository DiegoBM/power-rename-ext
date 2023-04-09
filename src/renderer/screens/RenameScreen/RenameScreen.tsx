import { useState, useEffect, useMemo } from 'react';
// Material UI
import Stack from '@mui/material/Stack';
// Material React Table
import type { MRT_RowSelectionState } from 'material-react-table';

import TitleBar from '@components/TitleBar';
import Grid from '@components/grid/Grid';
import RenameErrorsDialog from './RenameErrorsDialog';
import SettingsForm from '@components/settings/SettingsForm';
import { useMainData } from '@hooks/useMainData';
import { useRenames } from '@hooks/useRenames';
import type {
  SearchSettings,
  ReplaceSettings,
} from '@components/settings/SettingsForm';
import SplitButton, { type SplitButtonOption } from '@components/SplitButton';
import {
  RenameEntry,
  RenameOperation,
  processRenamesMessage,
} from '@common/ipc';

const defaultSearchSettings: SearchSettings = {
  input: '',
  useFunction: false,
  isRegex: false,
  matchesAll: true,
  isCaseSensitive: false,
};

const defaultReplaceSettings: ReplaceSettings = {
  input: '',
  useFunction: false,
  includeFiles: true,
  includeFolders: true,
  includeSubfolders: true,
  formatType: null,
  scope: 'base',
};

const options: SplitButtonOption[] = [
  { label: 'Apply', value: 'apply' },
  { label: 'Apply and close', value: 'apply-and-close' },
];

export default function RenameScreen() {
  const [searchSettings, setSearchSettings] = useState<SearchSettings>(
    defaultSearchSettings
  );
  const [replaceSettings, setReplaceSettings] = useState<ReplaceSettings>(
    defaultReplaceSettings
  );
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [currentOption, setCurrentOption] = useState<SplitButtonOption>(
    options[0]
  );

  const [mainData, setMainData] = useMainData();

  // If maindata changes, we need to reset the selected rows in the grid
  useEffect(() => setRowSelection({}), [mainData.pathEntries]);

  const entries = useRenames(
    mainData.scanPaths,
    mainData.pathEntries,
    searchSettings,
    replaceSettings
  );

  const handleApply = (option: SplitButtonOption) => {
    const operations = computeRenameOperations(entries, rowSelection);

    window.electron.ipcRenderer.sendMessage(
      ...processRenamesMessage(operations)
    );
    // TODO: implement apply and close
  };

  // Handles a failed rename operation
  const handleConfirmResults = () => {
    setMainData({ ...mainData, renameResults: null });
  };

  const canRename = useMemo<boolean>(
    () => canEnableApply(entries, rowSelection),
    [entries, rowSelection]
  );

  return (
    <>
      <TitleBar />
      <main>
        <aside>
          <Stack sx={{ height: '100%' }} gap={2}>
            <SettingsForm
              searchSettings={searchSettings}
              replaceSettings={replaceSettings}
              onSearchChange={(changes) =>
                setSearchSettings((settings) => ({ ...settings, ...changes }))
              }
              onReplaceChange={(changes) =>
                setReplaceSettings((settings) => ({ ...settings, ...changes }))
              }
            />
            <Stack direction="row" justifyContent="flex-end">
              <SplitButton
                disabled={!canRename}
                options={options}
                current={currentOption}
                onOptionSelect={setCurrentOption}
                onButtonClick={handleApply}
              />
            </Stack>
          </Stack>
        </aside>
        <section>
          <Grid
            entries={entries}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
          {mainData.renameResults && !mainData.renameResults.success && (
            <RenameErrorsDialog
              open={mainData.renameResults && !mainData.renameResults.success}
              results={mainData.renameResults.results}
              onClose={handleConfirmResults}
              onValueConfirmed={handleConfirmResults}
              forceConfirm={true}
            />
          )}
        </section>
      </main>
    </>
  );
}

function computeRenameOperations(
  entries: RenameEntry[],
  selection: MRT_RowSelectionState
): RenameOperation[] {
  let result: RenameOperation[] = [];

  entries.forEach((entry) => {
    let subEntries: RenameOperation[] = [];

    if (entry.subEntries) {
      subEntries = computeRenameOperations(entry.subEntries, selection);
    }

    if ((entry.fullPath in selection && entry.rename) || subEntries.length) {
      const newEntry: RenameOperation = {
        isDirectory: entry.isDirectory,
        basePath: entry.basePath,
        from: entry.base,
        to: entry.fullPath in selection && entry.rename ? entry.rename : null,
      };
      if (subEntries.length) {
        newEntry.subEntries = subEntries;
      }

      result.push(newEntry);
    }
  });

  return result;
}

function canEnableApply(
  entries: RenameEntry[],
  selection: MRT_RowSelectionState
): boolean {
  for (const entry of entries) {
    if (entry.rename && selection[entry.fullPath]) return true;

    if (entry.subEntries && canEnableApply(entry.subEntries, selection))
      return true;
  }

  return false;
}
