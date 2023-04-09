import { useMemo } from 'react';

import { PathEntry, RenameEntry } from '@common/ipc';

import type {
  SearchSettings,
  ReplaceSettings,
} from '@components/settings/SettingsForm';

type ReplacerFunction = (substring: string, ...args: any[]) => string;

export function useRenames(
  scanPaths: string[],
  entries: PathEntry[],
  search: SearchSettings | null,
  replace: ReplaceSettings | null
): RenameEntry[] {
  const canCalculate = search?.input && (replace?.input || search?.useFunction);
  return useMemo(
    () =>
      calculateRenames(scanPaths, entries, search, replace, {
        globalIndex: 0,
        fileInFolderIndex: {},
      }),
    [
      scanPaths,
      entries,
      canCalculate ? search : null,
      canCalculate ? replace : null,
    ]
  );
}

type RenameStats = {
  globalIndex: number;
  fileInFolderIndex: Record<string, number>;
};

type EntryStats = {
  globalIndex: number;
  fileInFolderIndex?: number;
  isFolder: boolean;
  stats?: RenameEntry['stats'];
};

function calculateRenames(
  scanPaths: string[],
  entries: PathEntry[],
  searchSettings: SearchSettings | null,
  replaceSettings: ReplaceSettings | null,
  renameStats: RenameStats
): RenameEntry[] {
  const renames: RenameEntry[] = [];

  for (const entry of entries) {
    // Create the new entry and add it straight away with no rename for the
    // time being
    const newRenameEntry: RenameEntry = {
      name: entry.name,
      base: entry.base,
      ext: entry.ext,
      isDirectory: entry.isDirectory,
      basePath: entry.basePath,
      fullPath: entry.fullPath,
      stats: entry.stats,
      rename: null,
    };
    renames.push(newRenameEntry);

    // Decide if we meet the conditions to compute a rename for the entry
    if (searchSettings != null && replaceSettings != null) {
      if (searchSettings.useFunction) {
        // If we are using a search function, we won't need neither the search
        // settings, nor the replace settings, since the search function is now
        // in charge of deciding everything it wants to do

        // Be extra forgiving while creating functions or executing replaces
        // since they could be created by inexperienced users, or run while the
        // the expression is yet complete
        try {
          let computedRename = createFunction(
            searchSettings.input ?? 's => s',
            createContext(entry, renameStats)
          )(entry.base);

          if (computedRename !== entry.base) {
            newRenameEntry.rename = computedRename;
            // Increase stats
            renameStats.globalIndex++;
            if (!entry.isDirectory)
              renameStats.fileInFolderIndex[entry.basePath]++;
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        const {
          input: replace,
          useFunction,
          includeFiles,
          includeFolders,
          includeSubfolders,
          scope,
        } = replaceSettings;
        const { input, isRegex, matchesAll, isCaseSensitive } = searchSettings;

        if (
          !(
            input == '' ||
            replace == '' ||
            (!includeFiles && !entry.isDirectory) ||
            (!includeFolders && entry.isDirectory) ||
            (!includeSubfolders &&
              !scanPaths.includes(entry.basePath) &&
              !scanPaths.includes(entry.fullPath))
          )
        ) {
          // If we reach this point, we can compute the rename
          const flags =
            '' + (matchesAll ? 'g' : '') + (!isCaseSensitive ? 'i' : '');

          // Be extra forgiving while creating functions or executing replaces
          // since they could be created by inexperienced users, or run while the
          // the expression is yet complete
          try {
            const replacer: ReplacerFunction = createFunction(
              useFunction ? replace : 's => s',
              createContext(entry, renameStats)
            );

            let computedRename = isRegex
              ? useFunction
                ? entry[scope].replace(new RegExp(input, flags), replacer)
                : entry[scope].replace(new RegExp(input, flags), replace) // This stupidity is just to keep typescript happy, because overloads...
              : standardReplace(
                  entry[scope],
                  input,
                  useFunction ? replacer : replace,
                  {
                    isCaseSensitive,
                    matchesAll,
                  }
                );

            if (replaceSettings.scope === 'name') computedRename += entry.ext;
            else if (replaceSettings.scope === 'ext')
              computedRename = entry.name + computedRename;

            if (computedRename !== entry.base) {
              newRenameEntry.rename = computedRename;
              // Increase stats
              renameStats.globalIndex++;
              if (!entry.isDirectory)
                renameStats.fileInFolderIndex[entry.basePath]++;
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    }

    // Process its sub-entries if it has any
    if (entry.subEntries) {
      newRenameEntry.subEntries = calculateRenames(
        scanPaths,
        entry.subEntries,
        searchSettings,
        replaceSettings,
        renameStats
      );
    }
  }

  return renames;
}

type StandardReplaceOptions = {
  isCaseSensitive: boolean;
  matchesAll: boolean;
};

function sameCharacters(a: string, b: string, caseSensitive: boolean): boolean {
  a = caseSensitive ? a : a.toLowerCase();
  b = caseSensitive ? b : b.toLowerCase();
  return a === b;
}

function sameString(
  source: string,
  search: string,
  index: number,
  caseSensitive: boolean
): boolean {
  let i = 0;
  while (
    i < search.length &&
    index + i < source.length &&
    sameCharacters(source[index + i], search[i], caseSensitive)
  ) {
    i++;
  }
  return i === search.length;
}

function standardReplace(
  source: string,
  search: string,
  replace: string | ReplacerFunction,
  options: StandardReplaceOptions
): string {
  if (search === '' || replace === '') return source;
  let result = '';
  let replaced = false;
  let i = 0;
  while (i < source.length) {
    if (
      sameCharacters(source[i], search[0], options.isCaseSensitive) &&
      (!replaced || options.matchesAll) &&
      sameString(source, search, i, options.isCaseSensitive)
    ) {
      result +=
        typeof replace === 'function' ? replace(search, i, source) : replace;
      i += search.length;
      replaced = true;
    } else {
      result += source[i++];
    }
  }

  return result;
}

function createContext(
  entry: PathEntry,
  replaceStats: RenameStats
): EntryStats {
  replaceStats.fileInFolderIndex[entry.basePath] =
    replaceStats.fileInFolderIndex[entry.basePath] ?? 0;

  return {
    globalIndex: replaceStats.globalIndex,
    fileInFolderIndex: !entry.isDirectory
      ? replaceStats.fileInFolderIndex[entry.basePath]
      : undefined,
    isFolder: entry.isDirectory,
    stats: entry.stats,
  };
}

function createFunction(code: string, context: EntryStats | {} = {}) {
  const setup = `'use strict'; var console = {}, window = {}, self = {}, top = {}, document = {}, location = {}, navigation = {}, navigator = {}, parent = {}, localStorage = {}, sessionStorage = {}, indexedDB = {}, open = {}, close = {}, openDatabase = {}, fetch = {}, Storage = {}, cookieStore = {}, CookieStore = {}, alert = {};`;

  const newCode = `return function() {${setup} return (${code}).bind(this);}.bind(this)()`;

  return new Function(newCode).bind(context)();
}
