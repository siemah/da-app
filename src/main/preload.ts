// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ChannelEnum } from '@/config/channels';

const electronHandler = {
  ipcRenderer: {
    sendMessage<T = any>(channel: ChannelEnum, ...args: T[]) {
      ipcRenderer.send(channel, ...args);
    },
    on<T = any>(channel: ChannelEnum, func: (...args: T[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: T[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    off<T = any>(channel: ChannelEnum, func: (...args: T[]) => void) {
      ipcRenderer.removeListener(channel, func);
    },
    once<T = any>(channel: ChannelEnum, func: (...args: T[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke<T = any>(channel: ChannelEnum, ...args: T[]) {
      ipcRenderer.invoke(channel, ...args);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
