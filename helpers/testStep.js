import { test } from '@playwright/test';

export async function testStep(title, stepToRun, actorLabel = null) {
  let stepTitle = actorLabel ? `${actorLabel}: ${title}` : title;

  return await test.step(stepTitle, stepToRun);
}

export { expect } from '@playwright/test';
