import { useState, useEffect } from 'react';

import { PathEntry, RenameEntry } from '@common/ipc';

import type {
  SearchSettings,
  ReplaceSettings,
} from '@components/settings/SettingsForm';

type ReplacerFunction = (substring: string, ...args: any[]) => string;
type AsyncReplacerFunction = (
  substring: string,
  ...args: any[]
) => Promise<string>;

type UseRenames = [data: RenameEntry[], loading: boolean, error: string | null];

export function useRenamesAsync(
  scanPaths: string[],
  entries: PathEntry[],
  search: SearchSettings | null,
  replace: ReplaceSettings | null
): UseRenames {
  const [data, setData] = useState<RenameEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCalculate = search?.input && (replace?.input || search?.useFunction);

  useEffect(() => {
    setLoading(true);
    setError(null);

    calculateRenames(scanPaths, entries, search, replace, {
      globalIndex: 0,
      fileInFolderIndex: {},
    })
      .then((data) => setData(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, [
    scanPaths,
    entries,
    canCalculate ? search : null,
    canCalculate ? replace : null,
  ]);

  // promise.then(data => )
  return [data, loading, error];
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

async function calculateRenames(
  scanPaths: string[],
  entries: PathEntry[],
  searchSettings: SearchSettings | null,
  replaceSettings: ReplaceSettings | null,
  renameStats: RenameStats
): Promise<RenameEntry[]> {
  const renames: RenameEntry[] = [];

  const promises: Promise<RenameEntry>[] = [];

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

    let processingReplacement = false;

    // Decide if we meet the conditions to compute a rename for the entry
    if (searchSettings != null && replaceSettings != null) {
      if (searchSettings.useFunction) {
        // If we are using a search function, we won't need neither the search
        // settings, nor the replace settings, since the search function is now
        // in charge of deciding everything it wants to do

        // Be extra forgiving while creating functions or executing replaces
        // since they could be created by inexperienced users, or run while the
        // the expression is yet complete. So they won't be considered errors
        // (even if in some cases they'll be)
        try {
          const replacer = createFunction(
            searchSettings.input ?? 's => s',
            createContext(entry, renameStats)
          );

          const promise: Promise<RenameEntry> = (
            isAsync(replacer)
              ? replacer(entry.base)
              : Promise.resolve(replacer(entry.base))
          ).then((computedRename: string): RenameEntry => {
            if (computedRename !== entry.base) {
              newRenameEntry.rename = computedRename;
              // Increase stats
              renameStats.globalIndex++;
              if (!entry.isDirectory) {
                renameStats.fileInFolderIndex[entry.basePath]++;
              }
            }

            return newRenameEntry;
          });

          promises.push(promise);
          processingReplacement = true;
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
          // the expression is yet complete. So they won't be considered errors
          // (even if in some cases they'll be)
          try {
            const replacer: ReplacerFunction | AsyncReplacerFunction =
              createFunction(
                useFunction ? replace : 's => s',
                createContext(entry, renameStats)
              );
            const asyncReplacer: AsyncReplacerFunction = isAsync(replacer)
              ? (replacer as AsyncReplacerFunction)
              : (...args) => Promise.resolve(replacer(...args));

            const promise: Promise<RenameEntry> = (
              isRegex
                ? useFunction
                  ? replaceAsync(
                      entry[scope],
                      new RegExp(input, flags),
                      asyncReplacer
                    )
                  : Promise.resolve(
                      entry[scope].replace(new RegExp(input, flags), replace)
                    )
                : standardReplace(
                    entry[scope],
                    input,
                    useFunction ? replacer : replace,
                    {
                      isCaseSensitive,
                      matchesAll,
                    }
                  )
            ).then((computedRename: string) => {
              if (replaceSettings.scope === 'name') computedRename += entry.ext;
              else if (replaceSettings.scope === 'ext')
                computedRename = entry.name + computedRename;

              if (computedRename !== entry.base) {
                newRenameEntry.rename = computedRename;
                // Increase stats
                renameStats.globalIndex++;
                if (!entry.isDirectory) {
                  renameStats.fileInFolderIndex[entry.basePath]++;
                }
              }

              return newRenameEntry;
            });

            promises.push(promise);
            processingReplacement = true;
          } catch (error) {
            console.error(error);
          }
        }
      }
    }

    // Process its sub-entries if it has any
    if (entry.subEntries) {
      newRenameEntry.subEntries = await calculateRenames(
        scanPaths,
        entry.subEntries,
        searchSettings,
        replaceSettings,
        renameStats
      );
    }

    if (!processingReplacement) promises.push(Promise.resolve(newRenameEntry));
  }

  return Promise.all(promises);
}

function isAsync(func: unknown): boolean {
  return (
    typeof func === 'function' && func.constructor.name === 'AsyncFunction'
  );
}

async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: AsyncReplacerFunction
) {
  const promises: Promise<string>[] = [];
  // Capture all matches
  str.replace(regex, (substring: string, ...args: any[]): string => {
    const promise = asyncFn(substring, ...args);
    promises.push(promise);
    return '';
  });
  // Wait for all replacemens to the matches
  const replacements = await Promise.all(promises);

  let i = 0;
  return str.replace(regex, () => replacements[i++]);
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

async function standardReplace(
  source: string,
  search: string,
  replace: string | ReplacerFunction | AsyncReplacerFunction,
  options: StandardReplaceOptions
): Promise<string> {
  if (search === '' || replace === '') return Promise.resolve(source);
  let result = '';
  let replaced = false;
  let i = 0;
  while (i < source.length) {
    if (
      sameCharacters(source[i], search[0], options.isCaseSensitive) &&
      (!replaced || options.matchesAll) &&
      sameString(source, search, i, options.isCaseSensitive)
    ) {
      const replacement = await (typeof replace === 'function'
        ? isAsync(replace)
          ? replace(search, i, source)
          : Promise.resolve(replace(search, i, source))
        : Promise.resolve(replace));
      result += replacement;
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
  const setup = `'use strict'; const console = {}, window = {}, self = {}, top = {}, document = {}, location = {}, navigation = {}, navigator = {}, parent = {}, localStorage = {}, sessionStorage = {}, indexedDB = {}, open = {}, close = {}, openDatabase = {}, fetch = {}, Storage = {}, cookieStore = {}, CookieStore = {}, alert = {};`;
  // const newCode = `return function() {${setup} const f = ${code}; return f.bind(this);}.bind(this)()`;
  const newCode = `return function() {${setup} return (${code}).bind(this);}.bind(this)()`;
  return new Function(newCode).bind(context)();
}
