import { render, screen } from '@testing-library/react';

import SettingsForm, {
  type SearchSettings,
  type ReplaceSettings,
} from '@components/settings/SettingsForm';

const defaultSearchSettings: SearchSettings = {
  input: 'search',
  isRegex: false,
  matchesAll: false,
  isCaseSensitive: false,
  useFunction: false,
};
const defaultReplaceSettings: ReplaceSettings = {
  input: 'replace',
  useFunction: false,
  includeFiles: false,
  includeFolders: false,
  includeSubfolders: false,
  formatType: null,
  scope: 'base',
};

describe('SettingsForm', () => {
  it('should render both search and replace settings forms', async () => {
    render(
      <SettingsForm
        searchSettings={defaultSearchSettings}
        replaceSettings={defaultReplaceSettings}
        onSearchChange={() => {}}
        onReplaceChange={() => {}}
      />
    );

    expect(screen.queryByPlaceholderText(/Search for/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Replace with/i)).toBeInTheDocument();
    expect(screen.queryAllByRole('form')).toHaveLength(2);
  });

  it('should not render the replace settings form is useFuntion is true in searchSettings', async () => {
    render(
      <SettingsForm
        searchSettings={{ ...defaultSearchSettings, useFunction: true }}
        replaceSettings={defaultReplaceSettings}
        onSearchChange={() => {}}
        onReplaceChange={() => {}}
      />
    );

    expect(
      screen.queryByRole('button', { name: /edit function/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/Replace with/i)
    ).not.toBeInTheDocument();
    expect(screen.queryAllByRole('form')).toHaveLength(1);
  });
});
