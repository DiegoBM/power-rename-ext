import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FilterMenu, { type Filter } from '@components/grid/FilterMenu';

const testFilters: Filter[] = [
  { label: 'Show All Files', value: 'show-all-files' },
  { label: 'Show Renamed Files', value: 'show-renamed-files' },
];

describe('FilterMenu', () => {
  it('should render initially in a collapsed state', () => {
    render(
      <FilterMenu
        filters={testFilters}
        currentFilter="show-all-files"
        onFilterClick={() => {}}
      />
    );
    expect(screen.queryByText(testFilters[0].label)).not.toBeInTheDocument();
  });

  it('should display a menu with two items once clicked', async () => {
    render(
      <FilterMenu
        filters={testFilters}
        currentFilter="show-all-files"
        onFilterClick={() => {}}
      />
    );
    const button = screen.getByRole('button');
    userEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText(testFilters[0].label)).toBeInTheDocument();
      expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    });
  });

  it('should retrurn the value given to each option menu', async () => {
    const handleClick = jest.fn();

    render(
      <FilterMenu
        filters={testFilters}
        currentFilter="show-all-files"
        onFilterClick={handleClick}
      />
    );

    const button = screen.getByRole('button');
    userEvent.click(button);
    let options = await screen.findAllByRole('menuitem');
    await userEvent.click(options[0]);
    expect(handleClick).toHaveBeenCalledWith(testFilters[0].value);

    userEvent.click(button);
    options = await screen.findAllByRole('menuitem');
    await userEvent.click(options[1]);
    expect(handleClick).toHaveBeenCalledWith(testFilters[0].value);
  });
});
