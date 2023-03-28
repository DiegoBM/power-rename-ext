/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath, processRenameOperations, scanPaths } from './util';

import {
  mainErrorMessage,
  scanResultsMessage,
  renameResultsMessage,
  initialArgumentsMessage,
  type IPCMainMessage,
  type WindowAction,
} from '../common/ipc';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

function processWindowAction(action: WindowAction): void {
  switch (action.type) {
    case 'change-color':
      mainWindow?.setTitleBarOverlay({
        color: action.background,
        symbolColor: action.icons,
      });
      break;
    default:
      // We should never reach here
      throw new Error(`Unknown Window action ${action}`);
  }
}

async function scan(event: Electron.IpcMainEvent, paths: string[]) {
  try {
    const pathEntries = await scanPaths(paths);
    event.reply(...scanResultsMessage({ scanPaths: paths, pathEntries }));
  } catch (error) {
    event.reply(...mainErrorMessage((error as Error).message));
  }
}

let testPaths = process.env.TESTPATHS?.split(',') ?? [];
ipcMain.on('ipc-communication', async (event, message: IPCMainMessage) => {
  switch (message.type) {
    case 'renderer-ready':
      // Upong being notified that the renderer window is already
      // listening for events, we will inform it of the initial arguments (if any)
      // This event will only happen once, when the renderer first starts
      // listening for messages.
      if (isDebug) {
        event.reply(...initialArgumentsMessage(testPaths));
      } else if (process.argv.length > 1) {
        const [cmd, ...paths] = process.argv;
        event.reply(...initialArgumentsMessage(paths));
      }
      break;
    case 'scan-paths':
      scan(event, message.payload);
      break;
    case 'process-renames':
      try {
        const results = await processRenameOperations(message.payload);
        event.reply(...renameResultsMessage(results));
      } catch (error) {
        event.reply(...mainErrorMessage((error as Error).message));
      }
      break;
    case 'window-action':
      processWindowAction(message.payload);
      break;
    default:
      // We should never reach here
      throw new Error(`Unknown IPC message ${message}`);
  }
});

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    titleBarStyle: 'hidden',
    titleBarOverlay: { height: 30 },
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();
  // mainWindow.menuBarVisible = false;
  mainWindow.removeMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
