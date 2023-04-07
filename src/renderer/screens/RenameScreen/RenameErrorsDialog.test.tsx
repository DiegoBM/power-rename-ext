import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RenameErrorsDialog from '@screens/RenameScreen/RenameErrorsDialog';

const testResults = [
  {
    fromPath: '/test.test',
    toPath: '/test._test',
    success: false,
    error: 'an error',
  },
  {
    fromPath: '/test2.test',
    toPath: '/test2._test',
    success: false,
    error: 'another error',
  },
];

describe('RenameErrorsDialog', () => {
  it('should render a dialog when explicitly opened with no results', () => {
    const { rerender } = render(
      <RenameErrorsDialog
        results={[]}
        onClose={() => {}}
        onValueConfirmed={() => {}}
        open={false}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <RenameErrorsDialog
        results={[]}
        onClose={() => {}}
        onValueConfirmed={() => {}}
        open={true}
      />
    );
    expect(screen.queryByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByText(/no records to display/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Errors in the rename operations/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Confirm/i })
    ).toBeInTheDocument();
  });

  it('should display as many results as the entries passed in the "results" prop', () => {
    render(
      <RenameErrorsDialog
        results={testResults}
        onClose={() => {}}
        onValueConfirmed={() => {}}
        open={true}
      />
    );

    // The header is also a row
    expect(screen.getAllByRole('row')).toHaveLength(testResults.length + 1);
  });

  it('should close the dialog with the "confirmButton" close reason when clicking the Confirm button', async () => {
    const handleClose = jest.fn();

    render(
      <RenameErrorsDialog
        results={[]}
        onClose={handleClose}
        onValueConfirmed={() => {}}
        open={true}
      />
    );
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    expect(handleClose).toHaveBeenCalledWith(
      expect.anything(),
      'confirmButton'
    );
  });

  it('should notify the parent when clicking the Confirm button', async () => {
    const handleValueConfirmed = jest.fn();

    render(
      <RenameErrorsDialog
        results={[]}
        onClose={() => {}}
        onValueConfirmed={handleValueConfirmed}
        open={true}
      />
    );
    expect(handleValueConfirmed).not.toHaveBeenCalledWith({});

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);
    expect(handleValueConfirmed).toHaveBeenCalled();
  });

  //---------------------------------------
  it('should not dismiss the dialog when clicking outside the dialog or by typing the escape key, when "forceConfirm" is true', async () => {
    const handleClose = jest.fn();
    const { rerender } = render(
      <RenameErrorsDialog
        results={[]}
        onClose={handleClose}
        onValueConfirmed={() => {}}
        open={true}
      />
    );
    expect(handleClose).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getAllByRole('presentation')[1]);
    expect(handleClose).toHaveBeenCalledTimes(2);

    handleClose.mockReset();
    rerender(
      <RenameErrorsDialog
        results={[]}
        onClose={handleClose}
        onValueConfirmed={() => {}}
        open={true}
        forceConfirm={true}
      />
    );
    expect(handleClose).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(handleClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getAllByRole('presentation')[1]);
    expect(handleClose).not.toHaveBeenCalled();
    // await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    // await waitFor(() => {
    //   expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // });
  });
});
