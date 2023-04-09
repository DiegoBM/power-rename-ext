// Fix for codemirror getBoundingClientRect issue
// https://github.com/jsdom/jsdom/issues/3002
import '@mocks/document.mock';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ReplaceSettingsForm, {
  type ReplaceSettings,
} from '@components/settings/ReplaceSettingsForm';

const defaultReplaceSettings: ReplaceSettings = {
  input: 'replace',
  useFunction: false,
  includeFiles: false,
  includeFolders: false,
  includeSubfolders: false,
  formatType: null,
  scope: 'base',
};

describe('ReplaceSettingsForm', () => {
  test('renders the replace settings form', () => {
    render(
      <ReplaceSettingsForm
        replaceSettings={defaultReplaceSettings}
        onReplaceChange={() => {}}
      />
    );

    expect(
      screen.queryByRole('form', { name: /replace settings/i })
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/replace with/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Use a replace function/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/apply to/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /include files/i, pressed: false })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /include folders/i, pressed: false })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /include subfolders/i,
        pressed: false,
      })
    ).toBeInTheDocument();
  });

  test('takes the default values for the inputs from the passed "replaceSettings" prop', () => {
    render(
      <ReplaceSettingsForm
        replaceSettings={{
          input: 'test',
          useFunction: false,
          includeFiles: true,
          includeFolders: true,
          includeSubfolders: true,
          formatType: 'lowercase',
          scope: 'ext',
        }}
        onReplaceChange={() => {}}
      />
    );

    expect(screen.getByPlaceholderText(/replace with/i)).toHaveValue('test');
    expect(
      screen.getByRole('checkbox', { name: /Use a replace function/i })
    ).not.toBeChecked();
    expect(
      screen.queryByLabelText(/apply to filename/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/apply to extension/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /include files/i, pressed: true })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /include folders/i, pressed: true })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /include subfolders/i,
        pressed: true,
      })
    ).toBeInTheDocument();
  });

  test('calls "onReplaceChange" when the user modifies the settings', async () => {
    const handleReplaceChange = jest.fn();
    render(
      <ReplaceSettingsForm
        replaceSettings={defaultReplaceSettings}
        onReplaceChange={handleReplaceChange}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /include files/i, pressed: false })
    );
    expect(handleReplaceChange).toHaveBeenCalledWith(
      expect.objectContaining({ includeFiles: true })
    );
    await userEvent.click(
      screen.getByRole('button', { name: /include folders/i, pressed: false })
    );
    expect(handleReplaceChange).toHaveBeenCalledWith(
      expect.objectContaining({ includeFolders: true })
    );
    await userEvent.click(
      screen.getByRole('button', {
        name: /include subfolders/i,
        pressed: false,
      })
    );
    expect(handleReplaceChange).toHaveBeenCalledWith(
      expect.objectContaining({ includeSubfolders: true })
    );
    await chooseOption(2);
    expect(handleReplaceChange).toHaveBeenCalledWith(
      expect.objectContaining({ scope: 'ext' })
    );
  });

  test('will additionally clear the textbox when the "use a function" checkbox gets enabled', async () => {
    const handleReplaceChange = jest.fn();
    render(
      <ReplaceSettingsForm
        replaceSettings={defaultReplaceSettings}
        onReplaceChange={handleReplaceChange}
      />
    );

    expect(screen.getByPlaceholderText(/replace with/i)).toHaveValue('replace');
    await userEvent.click(
      screen.getByRole('checkbox', { name: /Use a replace function/i })
    );
    expect(handleReplaceChange).toHaveBeenCalledWith(
      expect.objectContaining({
        useFunction: true,
        input: '',
      })
    );
  });

  test('debounces the call to "onReplaceChange" when the user types on the textbox', async () => {
    const handleReplaceChange = jest.fn();
    render(
      <ReplaceSettingsForm
        replaceSettings={{ ...defaultReplaceSettings, input: '' }}
        onReplaceChange={handleReplaceChange}
      />
    );

    const textbox = screen.getByPlaceholderText(/replace with/i);
    const inputText = 'test';

    expect(textbox).toHaveValue('');
    await userEvent.type(textbox, inputText);
    expect(handleReplaceChange).not.toHaveBeenCalled();
    await new Promise<void>((res) => setTimeout(() => res(), 500));
    expect(handleReplaceChange).toHaveBeenCalledWith(
      expect.objectContaining({ input: inputText })
    );
  });

  test('hides the textbox and display the "Edit function" button and the "use a function" checkbox if "useFunction" is true', () => {
    render(
      <ReplaceSettingsForm
        replaceSettings={{ ...defaultReplaceSettings, useFunction: true }}
        onReplaceChange={() => {}}
      />
    );

    expect(
      screen.queryByRole('button', { name: /edit function/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /Use a replace function/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/replace with/i)
    ).not.toBeInTheDocument();
  });

  test('displays a modal to edit the function if "useFunction" is true and the "Edit function" button is clicked', async () => {
    render(
      <ReplaceSettingsForm
        replaceSettings={{ ...defaultReplaceSettings, useFunction: true }}
        onReplaceChange={() => {}}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /edit function/i })
    );
    expect(screen.queryByRole('dialog')).toBeInTheDocument();
  });

  test('calls "onReplaceChange" when the user confirms the function', async () => {
    const handleReplaceChange = jest.fn();
    render(
      <ReplaceSettingsForm
        replaceSettings={{
          ...defaultReplaceSettings,
          input: '',
          useFunction: true,
        }}
        onReplaceChange={handleReplaceChange}
      />
    );

    const defaultFunction = `function (...args) {
  return args[0];
}`;

    await userEvent.click(
      screen.getByRole('button', { name: /edit function/i })
    );
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(handleReplaceChange).toHaveBeenCalledWith(
      expect.objectContaining({ input: defaultFunction })
    );
  });
});

export async function chooseOption(index: number): Promise<void> {
  if (index < 0) return;

  await userEvent.click(screen.getByLabelText(/apply to/i));
  const options = screen.getAllByRole('option');
  if (index >= options.length) return;

  await userEvent.click(options[index]);
}
