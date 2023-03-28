/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import fs from 'node:fs/promises';
import { renameSync } from 'node:fs';
import path from 'path';

import type {
  PathEntry,
  RenameEntry,
  RenameOperation,
  RenameResult,
  RenameResults,
} from '../common/ipc';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export async function scanPaths(paths: string[]): Promise<PathEntry[]> {
  return Promise.all(
    paths.map(async (scanPath) => {
      const { name, base, ext, dir } = path.parse(scanPath);

      // Check if its file or folder
      const stats = await fs.stat(scanPath);

      const pathEntry: PathEntry = {
        name,
        base,
        ext,
        stats: stats,
        basePath: dir,
        fullPath: scanPath,
        isDirectory: stats.isDirectory(),
      };

      if (stats.isDirectory()) {
        const entries = await fs.readdir(scanPath);
        pathEntry.subEntries = await scanPaths(
          entries.map((entry) => path.join(scanPath, entry))
        );
      }

      return pathEntry;
    })
  );
}

export async function processRenameOperations(
  operations: RenameOperation[]
): Promise<RenameResults> {
  const promises: Promise<RenameResult>[] = [];
  let childrenResults: RenameResult[] = [];
  let childrenSuccess = true;

  for (const operation of operations) {
    if (operation.subEntries) {
      const childrenResult = await processRenameOperations(
        operation.subEntries
      );
      childrenResults = [...childrenResults, ...childrenResult.results];
      childrenSuccess = childrenSuccess && childrenResult.success;
    }

    if (operation.to) {
      const fromPath = path.join(operation.basePath, operation.from);
      const toPath = path.join(operation.basePath, operation.to);
      promises.push(
        fs
          .rename(fromPath, toPath)
          .then(() => ({ fromPath, toPath, success: true, error: null }))
          .catch((error) => {
            throw new RenameError(fromPath, toPath, false, error.message);
          })
      );
    }
  }

  const promiseResults = await Promise.allSettled(promises);

  return promiseResults.reduce<RenameResults>(
    (acc, curr) => {
      if (curr.status === 'fulfilled') {
        acc.results.push(curr.value);
      } else {
        acc.results.push({ ...curr.reason });
        acc.success = false;
      }
      return acc;
    },
    { success: childrenSuccess, results: childrenResults }
  );
}

class RenameError extends Error {
  constructor(
    public fromPath: string,
    public toPath: string,
    public success: boolean,
    public error: string
  ) {
    super(error);
  }
}
