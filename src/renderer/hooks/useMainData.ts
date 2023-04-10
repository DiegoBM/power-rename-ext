import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

import {
  PathEntry,
  RenameResults,
  rendererReadyMessage,
  scanPathsMessage,
} from '@common/ipc';

type MainData = {
  scanPaths: string[];
  pathEntries: PathEntry[];
  renameResults: RenameResults | null;
  error: string | null;
};

// App-wide one-time-only initializer
let initialized = false;

export function useMainData(): [MainData, Dispatch<SetStateAction<MainData>>] {
  const [mainData, setMainData] = useState<MainData>({
    scanPaths: [],
    pathEntries: [],
    renameResults: null,
    error: null,
  });

  useEffect(() => {
    // calling IPC exposed from preload script
    const remove = window.electron.ipcRenderer.on(
      'ipc-communication',
      (message) => {
        switch (message.type) {
          case 'initial-arguments':
            // if we receive initial arguments, ask for them to be processed
            // We could also store the scanpaths now, but they will be stored in
            // the response anyay
            window.electron.ipcRenderer.sendMessage(
              ...scanPathsMessage(message.payload)
            );
            break;
          case 'scan-results':
            setMainData({
              ...mainData,
              scanPaths: message.payload.scanPaths,
              pathEntries: message.payload.pathEntries,
            });
            break;
          case 'rename-results':
            // When the rename operation finishes we receive a new set of rename Results,
            // so we need to create a new set of scanPaths in case that any of the
            // original arguments were modified during the rename operation
            const scanPaths = recreateScanPaths(
              mainData.scanPaths,
              message.payload
            );
            setMainData({
              ...mainData,
              scanPaths,
              renameResults: message.payload,
            });
            // Re-read the paths and update the grid after completion
            window.electron.ipcRenderer.sendMessage(
              ...scanPathsMessage(scanPaths)
            );
            break;
          case 'main-error':
            setMainData({
              ...mainData,
              error: message.payload,
            });
            break;
          default:
            // We should never reach here
            throw new Error(`Unknown IPC message ${message}`);
        }
      }
    );

    // This will and should run only once in the application's entire lifespan
    // No reason to add overhead with a ref
    if (!initialized) {
      window.electron.ipcRenderer.sendMessage(...rendererReadyMessage());
      initialized = true;
    }

    return remove;
  }, [mainData]);

  return [mainData, setMainData];
}

function recreateScanPaths(
  scanPaths: string[],
  { results }: RenameResults
): string[] {
  const newScanPaths = [...scanPaths];

  // I use this type of reconstruction with splice to respect the original order
  for (const result of results) {
    if (result.success) {
      const index = scanPaths.indexOf(result.fromPath);
      if (index !== -1) {
        newScanPaths.splice(index, 1, result.toPath);
      }
    }
  }

  return newScanPaths;
}
