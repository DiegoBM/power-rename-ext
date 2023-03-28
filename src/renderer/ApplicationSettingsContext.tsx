import { useState, useMemo, createContext, type ReactNode } from 'react';

type ApplicationSettings = {
  isProduction: boolean;
};

type ApplicationSettingsContext = {
  settings: ApplicationSettings;
  setSettings: React.Dispatch<React.SetStateAction<ApplicationSettings>>;
};

export const defaultSettings = {
  isProduction: window.electron.ipcRenderer.isProduction(),
};

const defaultContext: ApplicationSettingsContext = {
  settings: defaultSettings,
  setSettings: () => {},
};

export const applicationSettingsContext =
  createContext<ApplicationSettingsContext>(defaultContext);

type ApplicationSettingsProviderProps = {
  children: ReactNode;
  initialSettings?: ApplicationSettings;
};

export default function ApplicationSettingsProvider({
  children,
  initialSettings = defaultSettings,
}: ApplicationSettingsProviderProps) {
  const [settings, setSettings] =
    useState<ApplicationSettings>(initialSettings);

  const context = useMemo<ApplicationSettingsContext>(
    () => ({
      settings,
      setSettings,
    }),
    [settings, setSettings]
  );

  return (
    <applicationSettingsContext.Provider value={context}>
      {children}
    </applicationSettingsContext.Provider>
  );
}
