import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SplitButton from '@components/SplitButton';

const testOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
];

describe('SplitButton', () => {
  it('should render a collapsed button by default', () => {
    render(
      <SplitButton
        current={testOptions[0]}
        options={testOptions}
        onButtonClick={() => {}}
        onOptionSelect={() => {}}
      />
    );

    expect(
      screen.queryByRole('button', { name: testOptions[0].label })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: testOptions[0].label })
    ).not.toBeInTheDocument();
  });

  it('should display the "current" options in the main button', () => {
    const { rerender } = render(
      <SplitButton
        current={testOptions[0]}
        options={testOptions}
        onButtonClick={() => {}}
        onOptionSelect={() => {}}
      />
    );

    expect(
      screen.queryByRole('button', { name: testOptions[0].label })
    ).toBeInTheDocument();

    rerender(
      <SplitButton
        current={testOptions[1]}
        options={testOptions}
        onButtonClick={() => {}}
        onOptionSelect={() => {}}
      />
    );

    expect(
      screen.queryByRole('button', { name: testOptions[0].label })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: testOptions[1].label })
    ).toBeInTheDocument();
  });

  it('should expand the menu options upon clicking on the expander', async () => {
    render(
      <SplitButton
        current={testOptions[0]}
        options={testOptions}
        onButtonClick={() => {}}
        onOptionSelect={() => {}}
      />
    );

    const expander = getExpander();
    await userEvent.click(expander);
    expect(
      screen.queryByRole('menuitem', { name: testOptions[0].label })
    ).toBeInTheDocument();
  });

  it('should list all the options passed in the "options" prop', async () => {
    render(
      <SplitButton
        current={testOptions[0]}
        options={testOptions}
        onButtonClick={() => {}}
        onOptionSelect={() => {}}
      />
    );

    const expander = getExpander();
    await userEvent.click(expander);
    const options = screen.getAllByRole('menuitem');

    expect(options).toHaveLength(testOptions.length);
    testOptions.forEach(({ label }, index) =>
      expect(options[index]).toHaveTextContent(label)
    );
  });

  it('should action on the "current" option when the main button is clicked', async () => {
    const handleClick = jest.fn();
    render(
      <SplitButton
        current={testOptions[0]}
        options={testOptions}
        onButtonClick={handleClick}
        onOptionSelect={() => {}}
      />
    );

    const mainButton = screen.getByRole('button', {
      name: testOptions[0].label,
    });
    await userEvent.click(mainButton);
    expect(handleClick).toHaveBeenCalledWith(testOptions[0]);
  });

  it('should notify the selected option when one of the expandable options are clicked', async () => {
    const handleOptionSelect = jest.fn();
    render(
      <SplitButton
        current={testOptions[0]}
        options={testOptions}
        onButtonClick={() => {}}
        onOptionSelect={handleOptionSelect}
      />
    );

    const expander = getExpander();
    await userEvent.click(expander);
    const options = screen.getAllByRole('menuitem');

    await userEvent.click(options[1]);
    expect(handleOptionSelect).toHaveBeenCalledWith(testOptions[1]);
  });

  it('should not action on a newly selected option if clickOnSelect is false', async () => {
    const handleClick = jest.fn();
    render(
      <SplitButton
        current={testOptions[0]}
        options={testOptions}
        onButtonClick={handleClick}
        onOptionSelect={() => {}}
        clickOnSelect={false}
      />
    );

    expect(
      screen.queryByRole('button', { name: testOptions[0].label })
    ).toBeInTheDocument();
    const expander = getExpander();
    await userEvent.click(expander);
    const options = screen.getAllByRole('menuitem');

    await userEvent.click(options[1]);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should action on a newly selected option if clickOnSelect is false', async () => {
    const handleClick = jest.fn();
    render(
      <SplitButton
        current={testOptions[0]}
        options={testOptions}
        onButtonClick={handleClick}
        onOptionSelect={() => {}}
        clickOnSelect={true}
      />
    );

    expect(
      screen.queryByRole('button', { name: testOptions[0].label })
    ).toBeInTheDocument();
    const expander = getExpander();
    await userEvent.click(expander);
    const options = screen.getAllByRole('menuitem');

    await userEvent.click(options[1]);
    expect(handleClick).toHaveBeenCalledWith(testOptions[1]);
  });

  it('should disable the control', async () => {
    const handleClick = jest.fn();
    const { rerender } = render(
      <SplitButton
        current={testOptions[0]}
        options={testOptions}
        onButtonClick={() => {}}
        onOptionSelect={() => {}}
        disabled={false}
      />
    );

    expect(
      screen.queryByRole('button', { name: testOptions[0].label })
    ).not.toBeDisabled();
    expect(
      screen.queryByRole('group', { name: /split button/i })
    ).toHaveAttribute('aria-disabled', 'false');

    rerender(
      <SplitButton
        current={testOptions[0]}
        options={testOptions}
        onButtonClick={() => {}}
        onOptionSelect={() => {}}
        disabled={true}
      />
    );

    expect(
      screen.queryByRole('button', { name: testOptions[0].label })
    ).toBeDisabled();
    expect(
      screen.queryByRole('group', { name: /split button/i })
    ).toHaveAttribute('aria-disabled', 'true');
  });
});

function getExpander() {
  return screen.getByRole('button', {
    name: /select apply strategy/i,
  });
}
