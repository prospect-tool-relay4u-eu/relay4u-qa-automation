import { expect } from '@playwright/test';
import { test } from '../../fixtures/authFixtures.js';
import { ProjectsPage } from '../../pages/ProjectsPage.js';
import { ProjectDetailsPage } from '../../pages/ProjectDetailsPage.js';
import { HomePage } from '../../pages/HomePage.js';
import { faker } from '@faker-js/faker';

test('TC-SMOKE-001 - Standard user flow with login/logout @smoke', async ({
  projectsPage: page,
}) => {
  const projectsPage = new ProjectsPage(page);
  const projectDetailsPage = new ProjectDetailsPage(page);
  const homePage = new HomePage(page);
  let projectName = 'Smoke TestProjectName ' + faker.word.noun();

  await projectsPage.goto();

  await projectsPage.clickCreateProject();

  await projectsPage.assertCreateProjectFormVisible();

  await projectsPage.fillProjectNameField(projectName);
  await projectsPage.clickFormCreateNewProject();

  await projectsPage.assertProjectCreated(projectName);

  await projectDetailsPage.clickAddRecord();

  await projectDetailsPage.assertRecordFieldAdded(1);

  await projectDetailsPage.fillRecordField(1, 1, 'Company');
  await projectDetailsPage.fillRecordField(2, 1, 'TestValue');

  await projectDetailsPage.assertRecordFieldProperValue(1, 1, 'Company');
  await projectDetailsPage.assertRecordFieldProperValue(2, 1, 'TestValue');

  await projectDetailsPage.clickProjectsNavLink();

  await projectsPage.assertLoaded();

  await projectsPage.deleteProject(projectName);

  await projectsPage.assertProjectDeleted(projectName);

  await projectDetailsPage.clickLogOut();

  await homePage.assertLoaded();
});
