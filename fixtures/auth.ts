import {test as baseTest, Page, test} from '@playwright/test';
import fs from 'fs';
import path from 'path';

export * from '@playwright/test';
export const auth = baseTest.extend<NonNullable<unknown>, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = auth.info().parallelIndex;
      const fileName = path.resolve(auth.info().project.outputDir, `.auth/${id}.json`);

      if (fs.existsSync(fileName)) {
        await use(fileName);
        return;
      }
      const page = await browser.newPage({ storageState: undefined });

      await login(page);

      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: 'worker' },
  ],
});
export async function login(page: Page): Promise<void> {
  await test.step('Should fail', async () => {
    await page.goto("https://www.google.com/");
    await page.fill("body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input", "Гугл");
    await page.keyboard.press('Enter');
  });
}
