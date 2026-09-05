import { test as base } from '@playwright/test';
import { generateNewUser } from '../helpers/testData/generateNewUser';

export const test = base.extend({
  user: async ({}, use) => {
    const user = generateNewUser();

    await use(user);
  },
});

export { expect } from '@playwright/test';
