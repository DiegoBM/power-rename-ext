// Fix for codemirror getBoundingClientRect issue
// https://github.com/jsdom/jsdom/issues/3002
import '@mocks/document.mock';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchSettingsForm, {
  type SearchSettings,
} from '@components/settings/SearchSettingsForm';

const defaultSearchSettings: SearchSettings = {
  input: 'search',
  isRegex: false,
  matchesAll: false,
  isCaseSensitive: false,
  useFunction: false,
};

describe('SearchSettingsForm', () => {
  test('renders the search settings form', () => {
    render(
      <SearchSettingsForm
        searchSettings={defaultSearchSettings}
        onSearchChange={() => {}}
      />
    );

    expect(
      screen.queryByRole('form', { name: /search settings/i })
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/search for/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Use a function/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Use regular expressions/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Matches all occurrences/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Case sensitive/i })
    ).toBeInTheDocument();
  });

  test('takes the default values for the inputs from the passed "searchSettings" prop', () => {
    render(
      <SearchSettingsForm
        searchSettings={{
          input: 'test',
          isRegex: true,
          matchesAll: true,
          isCaseSensitive: true,
          useFunction: false,
        }}
        onSearchChange={() => {}}
      />
    );

    expect(screen.getByPlaceholderText(/search for/i)).toHaveValue('test');
    expect(
      screen.getByRole('checkbox', { name: /Use a function/i })
    ).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /Use regular expressions/i })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /Matches all occurrences/i })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /Case sensitive/i })
    ).toBeChecked();
  });

  test('calls "onSearchChange" when the user modifies the settings', async () => {
    const handleSearchChange = jest.fn();
    render(
      <SearchSettingsForm
        searchSettings={defaultSearchSettings}
        onSearchChange={handleSearchChange}
      />
    );

    await userEvent.click(
      screen.getByRole('checkbox', { name: /Use regular expressions/i })
    );
    expect(handleSearchChange).toHaveBeenCalledWith(
      expect.objectContaining({ isRegex: true })
    );
    await userEvent.click(
      screen.getByRole('checkbox', { name: /Matches all occurrences/i })
    );
    expect(handleSearchChange).toHaveBeenCalledWith(
      expect.objectContaining({ matchesAll: true })
    );
    await userEvent.click(
      screen.getByRole('checkbox', { name: /Case sensitive/i })
    );
    expect(handleSearchChange).toHaveBeenCalledWith(
      expect.objectContaining({ isCaseSensitive: true })
    );
  });

  test('will additionally clear the textbox when the "use a function" checkbox gets enabled', async () => {
    const handleSearchChange = jest.fn();
    render(
      <SearchSettingsForm
        searchSettings={defaultSearchSettings}
        onSearchChange={handleSearchChange}
      />
    );

    expect(screen.getByPlaceholderText(/search for/i)).toHaveValue('search');
    await userEvent.click(
      screen.getByRole('checkbox', { name: /Use a function/i })
    );
    expect(handleSearchChange).toHaveBeenCalledWith(
      expect.objectContaining({ useFunction: true, input: '' })
    );
  });

  test('debounces the call to "onSearchChange" when the user types on the textbox', async () => {
    const handleSearchChange = jest.fn();
    render(
      <SearchSettingsForm
        searchSettings={{ ...defaultSearchSettings, input: '' }}
        onSearchChange={handleSearchChange}
      />
    );

    const textbox = screen.getByPlaceholderText(/search for/i);
    const inputText = 'test';

    expect(textbox).toHaveValue('');
    await userEvent.type(textbox, inputText);
    expect(handleSearchChange).not.toHaveBeenCalled();
    await new Promise<void>((res) => setTimeout(() => res(), 500));
    expect(handleSearchChange).toHaveBeenCalledWith(
      expect.objectContaining({ input: inputText })
    );
  });

  test('only renders the "Edit function" button and the "use a function" checkbox if "useFunction" is true', () => {
    render(
      <SearchSettingsForm
        searchSettings={{ ...defaultSearchSettings, useFunction: true }}
        onSearchChange={() => {}}
      />
    );

    expect(
      screen.queryByRole('button', { name: /edit function/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Use a function/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/search for/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Use regular expressions/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Matches all occurrences/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Case sensitive/i })
    ).not.toBeInTheDocument();
  });

  test('displays a modal to edit the function if "useFunction" is true and the "Edit function" button is clicked', async () => {
    render(
      <SearchSettingsForm
        searchSettings={{ ...defaultSearchSettings, useFunction: true }}
        onSearchChange={() => {}}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /edit function/i })
    );
    expect(screen.queryByRole('dialog')).toBeInTheDocument();
  });

  test('calls "onSearchChange" when the user confirms the function', async () => {
    const handleSearchChange = jest.fn();
    render(
      <SearchSettingsForm
        searchSettings={{
          ...defaultSearchSettings,
          input: '',
          useFunction: true,
        }}
        onSearchChange={handleSearchChange}
      />
    );

    const defaultFunction = `function (search) {
  return 'replace';
}`;

    await userEvent.click(
      screen.getByRole('button', { name: /edit function/i })
    );
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(handleSearchChange).toHaveBeenCalledWith(
      expect.objectContaining({ input: defaultFunction })
    );
  });
});
