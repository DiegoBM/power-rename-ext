// Fix for codemirror getBoundingClientRect issue
// https://github.com/jsdom/jsdom/issues/3002
import '@mocks/document.mock';

import { render, screen, fireEvent } from '@testing-library/react';

import FunctionEditorDialog from '@components/functions/FunctionEditorDialog';
import userEvent from '@testing-library/user-event';

describe('FunctionEditorDialog', () => {
  test('will not render the dialog until explicitly open', () => {
    render(
      <FunctionEditorDialog
        initialValue=""
        onClose={() => {}}
        onValueConfirmed={() => {}}
        open={false}
      />
    );

    expect(
      screen.queryByText(/Please type a JavaScript function/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Confirm/i })
    ).not.toBeInTheDocument();
  });

  test('renders a text editor with the passed initialValue', () => {
    const initialValue = 'testFunction';
    render(
      <FunctionEditorDialog
        initialValue={initialValue}
        onClose={() => {}}
        onValueConfirmed={() => {}}
        open={true}
      />
    );
    expect(
      screen.queryByText(/Please type a JavaScript function/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Confirm/i })
    ).toBeInTheDocument();

    expect(screen.queryByText(initialValue)).toBeInTheDocument();
  });

  test('closes the dialog with the cancelButton reason when clicking the Cancel button', async () => {
    const handleClose = jest.fn();

    render(
      <FunctionEditorDialog
        initialValue=""
        onClose={handleClose}
        onValueConfirmed={() => {}}
        open={true}
      />
    );
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalledWith(expect.anything(), 'cancelButton');
  });

  test('closes the dialog with the confirmButton reason when clicking the Confirm button', async () => {
    const handleClose = jest.fn();

    render(
      <FunctionEditorDialog
        initialValue=""
        onClose={handleClose}
        onValueConfirmed={() => {}}
        open={true}
      />
    );
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await userEvent.click(confirmButton);

    expect(handleClose).toHaveBeenCalledWith(
      expect.anything(),
      'confirmButton'
    );
  });

  test('returns the initial value when the confirm button is clicked and the input has not been editted', async () => {
    const initialValue = 'test';
    const handleValueConfirmed = jest.fn();

    render(
      <FunctionEditorDialog
        initialValue={initialValue}
        onClose={() => {}}
        onValueConfirmed={handleValueConfirmed}
        open={true}
      />
    );
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await userEvent.click(confirmButton);

    expect(handleValueConfirmed).toHaveBeenCalledWith(initialValue);
  });

  test('allows the user to introduce a new function', async () => {
    const newFunction = 'newFunction';
    const handleValueConfirmed = jest.fn();

    render(
      <FunctionEditorDialog
        initialValue=""
        onClose={() => {}}
        onValueConfirmed={handleValueConfirmed}
        open={true}
      />
    );

    const editor = screen.getByRole('textbox');
    // userEvent does not support contentEditable divs, so inject the value ddirectly
    // https://github.com/testing-library/user-event/issues/230
    fireEvent.input(editor, { target: { textContent: newFunction } });
    await screen.findByText(newFunction);

    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await userEvent.click(confirmButton);
    expect(handleValueConfirmed).toHaveBeenCalledWith(newFunction);
  });
});
