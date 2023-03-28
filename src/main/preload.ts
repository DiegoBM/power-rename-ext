// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

import type { Channels, IPCMainMessage, IPCRendererMessage } from 'common/ipc';

const electronHandler = {
  ipcRenderer: {
    isProduction() {
      return process.env.NODE_ENV === 'production';
    },
    sendMessage(channel: Channels, message: IPCMainMessage) {
      ipcRenderer.send(channel, message);
    },
    on(channel: Channels, func: (message: IPCRendererMessage) => void) {
      const subscription = (
        _event: IpcRendererEvent,
        message: IPCRendererMessage
      ) => func(message);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (message: IPCRendererMessage) => void) {
      ipcRenderer.once(channel, (_event, message) => func(message));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
