import { test, expect } from '../../../fixtures/LoggedInPage';
import { ProjectsPage } from '../../../pages/ProjectsPage';
import { faker } from '@faker-js/faker';

test('TC-PROJ-001: Create project with valid name@crud', async ({
  loggedInPage,
}) => {
  const projectsPage = new ProjectsPage(loggedInPage);

  await projectsPage.goto();
  await projectsPage.clickCreateProject();
  await projectsPage.assertCreateProjectFormVisible();

  const projectName = 'TestProjectName ' + faker.word.noun();

  await projectsPage.fillProjectNameField(projectName);
  await projectsPage.clickFormCreateNewProject();

  await projectsPage.assertProjectCreated();
});
