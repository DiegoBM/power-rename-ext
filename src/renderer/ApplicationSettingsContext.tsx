import {
  useState,
  useMemo,
  createContext,
  useContext,
  type ReactNode,
} from 'react';

export type ApplicationSettings = {
  isProduction: boolean;
  platform: string;
};

type ApplicationSettingsContext = {
  settings: ApplicationSettings;
  setSettings: React.Dispatch<React.SetStateAction<ApplicationSettings>>;
};

const defaultSettings: ApplicationSettings = {
  isProduction: window.electron.ipcRenderer.isProduction(),
  platform: window.electron.ipcRenderer.platform(),
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

export function useApplicationSettings() {
  const context = useContext(applicationSettingsContext);

  if (!context) {
    throw new Error(
      'useApplicationSettings should be used within an ApplicationSettingsProvider'
    );
  }

  return context;
}

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
