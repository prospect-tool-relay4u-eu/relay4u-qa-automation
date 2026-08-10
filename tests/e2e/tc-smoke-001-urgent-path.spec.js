import { expect } from '@playwright/test';
import { test } from '../../fixtures/authFixtures.js';
import { ProjectsPage } from '../../pages/ProjectsPage.js';
import { ProjectDetailsPage } from '../../pages/ProjectDetailsPage.js';
import { HomePage } from '../../pages/HomePage.js';
import { faker } from '@faker-js/faker';
import { existingUser } from '../../helpers/testData/existingUser';

let projectName = 'Smoke TestProjectName ' + faker.word.noun();

test.beforeEach(async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login(existingUser.email, existingUser.password);
});

test.afterEach(async ({ page }) => {
  const projectDetailsPage = new ProjectDetailsPage(page);
  const projectsPage = new ProjectsPage(page);
  const homePage = new HomePage(page);

  await page.waitForTimeout(3000);

  await projectsPage.goto();

  await projectsPage.assertLoaded();

  await projectsPage.deleteProject(projectName);

  await projectsPage.assertProjectDeleted(projectName);

  await projectsPage.clickLogOut();

  await homePage.assertLoaded();
});

test('TC-SMOKE-001 - Standard user flow with login/logout @smoke', async ({
  page,
}) => {
  const projectsPage = new ProjectsPage(page);
  const projectDetailsPage = new ProjectDetailsPage(page);
  const homePage = new HomePage(page);

  await projectsPage.goto();

  await projectsPage.clickNewProjectButton();

  await projectsPage.assertCreateProjectFormVisible();

  await projectsPage.fillProjectNameField(projectName);
  await projectsPage.clickCreateProjectButton();

  await projectsPage.assertProjectCreated(projectName);

  await projectDetailsPage.assertColumnsOrder(
    '#',
    'Full Name',
    'Company',
    'Message Sent',
    'Replied?',
    'Reply Content',
  );

  await projectDetailsPage.clickAddRecord();

  await projectDetailsPage.assertRecordFieldAdded(1);

  await projectDetailsPage.fillRecordField(1, 1, 'Company');
  await projectDetailsPage.fillRecordField(1, 2, 'TestValue');
  await projectDetailsPage.clickRecordField(1, 4);

  await projectDetailsPage.assertRecordFieldProperValue(1, 1, 'Company');
  await projectDetailsPage.assertRecordFieldProperValue(1, 2, 'TestValue');
  await projectDetailsPage.assertRecordFieldProperValue(1, 4, 'Yes');

  await projectDetailsPage.clickAddRecord();

  await projectDetailsPage.assertRecordFieldAdded(2);

  await projectDetailsPage.fillRecordField(2, 1, 'Company2');
  await projectDetailsPage.fillRecordField(2, 2, 'TestValue2');
  await projectDetailsPage.clickRecordField(2, 4);

  await projectDetailsPage.assertRecordFieldProperValue(2, 1, 'Company2');
  await projectDetailsPage.assertRecordFieldProperValue(2, 2, 'TestValue2');
  await projectDetailsPage.assertRecordFieldProperValue(2, 4, 'Yes');

  await projectDetailsPage.clickRecordDeleteButton(2);

  await projectDetailsPage.assertRecordDeleted(2);

  await projectDetailsPage.clickRecordDeleteButton(1);

  await projectDetailsPage.assertRecordDeleted(1);
});
