export type Channels = 'ipc-communication';
import type { Stats } from 'fs';

export type PathEntry = {
  name: string;
  base: string;
  ext: string;
  isDirectory: boolean;
  basePath: string;
  fullPath: string;
  subEntries?: PathEntry[];
  stats?: Stats;
};

export type RenameEntry = PathEntry & {
  rename: string | null;
  subEntries?: RenameEntry[];
  stats?: Stats;
};

export type RenameOperation = {
  basePath: string;
  from: string;
  to: string | null;
  isDirectory: boolean;
  subEntries?: RenameOperation[];
};

export type RenameResult = {
  fromPath: string;
  toPath: string;
  success: boolean;
  error: string | null;
};

export type RenameResults = {
  success: boolean;
  results: RenameResult[];
};

type ScanResults = {
  scanPaths: string[];
  pathEntries: PathEntry[];
};

export type WindowAction =
  | { type: 'change-color'; icons?: string; background?: string }
  | { type: 'close' };

type ProcessRenamesOptions = {
  exit?: boolean;
};

type IPCScanPaths = { type: 'scan-paths'; payload: string[] };
type IPCScanResults = { type: 'scan-results'; payload: ScanResults };
type IPCProcessRenames = {
  type: 'process-renames';
  payload: { renames: RenameOperation[]; options: ProcessRenamesOptions };
};
type IPCRenameResults = { type: 'rename-results'; payload: RenameResults };
type IPCRendererReady = { type: 'renderer-ready' };
type IPCInitialArguments = { type: 'initial-arguments'; payload: string[] };
type IPCWindowAction = { type: 'window-action'; payload: WindowAction };
type IPCMainError = { type: 'main-error'; payload: string };
type IPCRendererError = { type: 'renderer-error'; payload: string };

export type IPCMainMessage =
  | IPCRendererReady
  | IPCScanPaths
  | IPCProcessRenames
  | IPCWindowAction
  | IPCRendererError;
export type IPCRendererMessage =
  | IPCInitialArguments
  | IPCScanResults
  | IPCRenameResults
  | IPCMainError;

type Channel<T> = [Channels, T];

function channel<T>(message: T): Channel<T> {
  return ['ipc-communication', message];
}

export function rendererReadyMessage(): Channel<IPCRendererReady> {
  return channel<IPCRendererReady>({ type: 'renderer-ready' });
}

export function initialArgumentsMessage(
  paths: string[]
): Channel<IPCInitialArguments> {
  return channel<IPCInitialArguments>({
    type: 'initial-arguments',
    payload: paths,
  });
}

export function scanPathsMessage(paths: string[]): Channel<IPCScanPaths> {
  return channel<IPCScanPaths>({ type: 'scan-paths', payload: paths });
}

export function scanResultsMessage(
  results: ScanResults
): Channel<IPCScanResults> {
  return channel<IPCScanResults>({ type: 'scan-results', payload: results });
}

export function processRenamesMessage(
  renames: RenameOperation[],
  options: ProcessRenamesOptions
): Channel<IPCProcessRenames> {
  return channel<IPCProcessRenames>({
    type: 'process-renames',
    payload: { renames, options },
  });
}

export function renameResultsMessage(
  results: RenameResults
): Channel<IPCRenameResults> {
  return channel<IPCRenameResults>({
    type: 'rename-results',
    payload: results,
  });
}

export function windowActionMessage(
  action: WindowAction
): Channel<IPCWindowAction> {
  return channel<IPCWindowAction>({ type: 'window-action', payload: action });
}

export function mainErrorMessage(action: string): Channel<IPCMainError> {
  return channel<IPCMainError>({ type: 'main-error', payload: action });
}

export function rendererErrorMessage(
  action: string
): Channel<IPCRendererError> {
  return channel<IPCRendererError>({ type: 'renderer-error', payload: action });
}
