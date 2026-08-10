import { expect } from '../helpers/testStep';
import { BasePage } from './BasePage';

export class ProjectsPage extends BasePage {
  constructor(page, actorLabel = null) {
    super(page, actorLabel);
    this.pageAnchor = page.getByRole('heading', {
      name: 'Projects',
      exact: true,
    });
    this.userNameDisplay = page.locator('.user-email');
    this.newProjectButton = page.getByRole('button', { name: '+ New project' });
    this.projectNameInput = page.getByRole('textbox', { name: 'Project name' });
    this.createProjectButton = page.getByRole('button', {
      name: 'Create project',
    });
    this.newProjectModal = page.getByRole('heading', { name: 'New project' });
    this.cancelCreatingProjectButton = page.getByRole('button', {
      name: 'Cancel',
    });
    this.logOutButton = this.page.getByRole('button', { name: 'Log out' });
  }

  async goto() {
    await this.step(`Navigate to projects page`, async () => {
      await this.page.goto('/projects');
    });
  }

  async assertLoaded() {
    await this.step(`Assert projects page is loaded`, async () => {
      await expect(this.pageAnchor).toBeVisible();
    });
  }

  async assertUserNameDisplayed(fullName) {
    await this.step(
      `Assert logged-in user name "${fullName}" is shown`,
      async () => {
        await expect(this.userNameDisplay).toHaveText(fullName);
      },
    );
  }

  async clickNewProjectButton() {
    await this.step('Click "New project" button', async () => {
      await this.newProjectButton.click();
    });
  }

  async assertCreateProjectFormVisible() {
    await this.step(
      'Assert "New project" form is visible and "Create" button is disabled',
      async () => {
        await expect(this.newProjectModal).toBeVisible();

        await expect(this.projectNameInput).toBeVisible();

        await expect(this.cancelCreatingProjectButton).toBeVisible();

        await expect(this.createProjectButton).toBeDisabled();
      },
    );
  }

  async fillProjectNameField(projectName) {
    await this.step(
      `Fill project name field with "${projectName}"`,
      async () => {
        await this.projectNameInput.fill(projectName);
      },
    );
  }

  async clickCreateProjectButton() {
    await this.step('Click "Create project" button on form', async () => {
      await this.createProjectButton.click();
    });
  }

  async assertProjectCreated(projectName) {
    await this.step(
      `Assert project "${projectName}" is successfully created`,
      async () => {
        await expect(this.page.getByText(`${projectName}`)).toBeVisible();
      },
    );
  }

  async deleteProject(projectName) {
    await this.step(`Delete project "${projectName}"`, async () => {
      const projectCard = this.page
        .locator('div.project-card')
        .filter({ hasText: projectName });

      await projectCard
        .getByRole('button', { name: 'Delete project', exact: true })
        .click();

      await projectCard
        .getByRole('button', { name: 'Yes, delete', exact: true })
        .click();
    });
  }

  async assertProjectDeleted(projectName) {
    await this.step(
      `Assert project "${projectName}" is successfully deleted`,
      async () => {
        await expect(this.page.getByText(`${projectName}`)).toBeHidden();
      },
    );
  }

  async clickLogOut() {
    return this.step('Log out', async () => {
      await this.logOutButton.click();
    });
  }
}
