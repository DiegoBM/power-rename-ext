import {
  test,
  expect,
  _electron as electron,
  Page,
  ElectronApplication,
} from '@playwright/test';
import path from 'path';

test.describe('Home page', () => {
  let page: Page;
  let electronApp: ElectronApplication;

  test.beforeEach(async () => {
    electronApp = await electron.launch({
      args: [
        path.join(__dirname, '..', 'release', 'app', 'dist', 'main', 'main.js'),
        path.join(__dirname, '..', 'assets'),
      ],
    });

    page = await electronApp.firstWindow();

    // Direct Electron console to Node terminal.
    page.on('console', console.log);
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test.describe('controls can be reached and operated', () => {
    test.describe('search settings form', () => {
      test('search textbox', async () => {
        const input = page.getByPlaceholder(/search for/i);
        await input.fill('24x24');
        await expect(input).toHaveValue('24x24');
      });

      test('"Use a function" checkbox', async () => {
        const input = page.getByRole('checkbox', { name: /Use a function/i });

        expect(await input.isChecked()).toBeFalsy();
        await input.check();
        expect(await input.isChecked()).toBeTruthy();
      });

      test('"Use regular expressions" checkbox', async () => {
        const input = page.getByRole('checkbox', {
          name: /Use regular expressions/i,
        });

        expect(await input.isChecked()).toBeFalsy();
        await input.check();
        expect(await input.isChecked()).toBeTruthy();
      });

      test('"Matches all occurrences" checkbox', async () => {
        const input = page.getByRole('checkbox', {
          name: /Matches all occurrences/i,
        });

        expect(await input.isChecked()).toBeTruthy();
        await input.uncheck();
        expect(await input.isChecked()).toBeFalsy();
      });

      test('"Case sensitive" checkbox', async () => {
        const input = page.getByRole('checkbox', { name: /Case sensitive/i });

        expect(await input.isChecked()).toBeFalsy();
        await input.check();
        expect(await input.isChecked()).toBeTruthy();
      });

      test('"Edit function" button', async () => {
        const input = page.getByRole('checkbox', { name: /Use a function/i });
        const button = page.getByRole('button', { name: /edit function/i });

        expect(button).not.toBeVisible();
        await page.getByRole('checkbox', { name: /Use a function/i }).check();
        expect(button).toBeVisible();
      });
    });

    test.describe('replace settings form', () => {
      test('replace textbox', async () => {
        const input = page.getByPlaceholder(/replace with/i);

        await input.fill('24+24');
        await expect(input).toHaveValue('24+24');
      });

      test('"Use a replace function" checkbox', async () => {
        const input = page.getByRole('checkbox', {
          name: /Use a replace function/i,
        });

        expect(await input.isChecked()).toBeFalsy();
        await input.check();
        expect(await input.isChecked()).toBeTruthy();
      });

      test('"Apply to" dropdown', async () => {
        const input = page.getByRole('button', { name: /apply to/i });
        const extensionOption = page.getByRole('option', {
          name: /extension only/i,
        });

        expect(input).toHaveCount(1);
        expect(input).toContainText(/filename \+ extension/i);
        expect(extensionOption).not.toBeVisible();
        await input.click();
        expect(extensionOption).toBeVisible();
        await extensionOption.click();
        await expect(extensionOption).not.toBeVisible();
        await expect(input).toContainText(/extension only/i);
      });

      test('"Include files" toggle button', async () => {
        const input = page.getByRole('button', {
          name: /include files/i,
          pressed: true,
        });
        expect(input).toHaveCount(1);
        await input.click();
        expect(input).toHaveCount(0);
      });

      test('"Include folders" toggle button', async () => {
        const input = page.getByRole('button', {
          name: /include folders/i,
          pressed: true,
        });
        expect(input).toHaveCount(1);
        await input.click();
        expect(input).toHaveCount(0);
      });

      test('"Include subfolders" toggle button', async () => {
        const input = page.getByRole('button', {
          name: /include subfolders/i,
          pressed: true,
        });
        expect(input).toHaveCount(1);
        await input.click();
        expect(input).toHaveCount(0);
      });

      test('"Edit function" button', async () => {
        const input = page.getByRole('checkbox', {
          name: /Use a replace function/i,
        });
        const button = page.getByRole('button', { name: /edit function/i });

        expect(button).not.toBeVisible();
        await input.check();
        expect(button).toBeVisible();
      });
    });

    test.describe('grid', () => {
      test('"filter" button', async () => {
        const input = page.getByRole('button', { name: /filter/i });
        let allfilesItem = page.getByRole('menuitem', {
          name: /show all files/i,
        });

        expect(input).toHaveCount(1);
        expect(allfilesItem).not.toBeVisible();
        await input.click();
        expect(allfilesItem).toBeVisible();
      });
    });

    test.describe('rename screen', () => {
      test('"apply" button', async () => {
        const input = page.getByRole('group', { name: /split button/i });

        await expect(input).toBeVisible();
        await expect(input).toBeDisabled();

        await page.getByPlaceholder(/search for/i).fill('.');
        await page.getByPlaceholder(/replace with/i).fill('._');
        await page
          .getByRole('checkbox', { name: /toggle select all/i })
          .check();
        await expect(input).not.toBeDisabled();
      });
    });
  });

  test.describe('Functions', () => {
    test('Can input a global function', async () => {
      const input = page.getByRole('checkbox', { name: /Use a function/i });
      const button = page.getByRole('button', { name: /edit function/i });
      const dialog = page.getByRole('dialog');
      const replacement = 'test_replacement_e2e';

      await expect(dialog).toHaveCount(0);
      await input.check();
      await button.click();
      await expect(dialog).toHaveCount(1);
      const textbox = dialog.getByRole('textbox');
      textbox.fill(`() => "${replacement}"`);
      await dialog.getByRole('button', { name: /confirm/i }).click();
      await expect(page.getByRole('table')).toContainText(replacement);
    });

    test('Can input a replacement function', async () => {
      const input = page.getByRole('checkbox', {
        name: /Use a replace function/i,
      });
      const button = page.getByRole('button', { name: /edit function/i });
      const dialog = page.getByRole('dialog');
      const replacement = 'test_replacement_e2e';

      await expect(dialog).toHaveCount(0);
      await page.getByPlaceholder(/search for/i).fill('.');
      await input.check();
      await button.click();
      await expect(dialog).toHaveCount(1);
      const textbox = dialog.getByRole('textbox');
      textbox.fill(`() => "${replacement}"`);
      await dialog.getByRole('button', { name: /confirm/i }).click();
      await expect(page.getByRole('table')).toContainText(replacement);
    });
  });

  test('application is not packaged dummy test', async () => {
    const isPackaged = await electronApp.evaluate(async ({ app }) => {
      // This runs in Electron's main process, parameter here is always
      // the result of the require('electron') in the main app script.
      return app.isPackaged;
    });

    expect(isPackaged).toBe(false);
  });
});

async function pause(ms: number = 5000) {
  return await new Promise<void>((res) => setTimeout(() => res(), ms));
}
