import { mergeTests } from '@playwright/test';
import { test as authTest } from './authFixtures';
import { test as userTest } from './userFixtures';

export const test = mergeTests(authTest, userTest);

export { expect } from '@playwright/test';
