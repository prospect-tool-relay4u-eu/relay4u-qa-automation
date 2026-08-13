import { expect } from '../../helpers/testStep';
import { BasePage } from '../BasePage';

export class ProjectsPage extends BasePage {
  constructor(page, actorLabel = null) {
    super(page, actorLabel);

    this.pageAnchor = page.getByRole('heading', {
      name: 'Projects',
      exact: true,
    });
    this.userNameDisplay = page.locator('.user-email');
    this.newProjectButton = page.getByRole('button', {
      name: '+ New project',
    });
    this.projectNameInput = page.getByRole('textbox', {
      name: 'Project name',
    });
    this.createProjectButton = page.getByRole('button', {
      name: 'Create project',
    });
    this.newProjectHeading = page.getByRole('heading', {
      name: 'New project',
    });
    this.cancelCreatingProjectButton = page.getByRole('button', {
      name: 'Cancel',
    });
    this.logOutButton = page.getByRole('button', { name: 'Log out' });
    this.projectCards = page.locator('div.project-card');
  }

  getProjectCard(projectName) {
    return this.projectCards.filter({ hasText: projectName });
  }

  getProjectCardActions(projectName) {
    const card = this.getProjectCard(projectName);

    return {
      deleteButton: card.getByRole('button', {
        name: 'Delete project',
        exact: true,
      }),
      confirmDeleteButton: card.getByRole('button', {
        name: 'Yes, delete',
        exact: true,
      }),
    };
  }

  async openAndAssert() {
    await this.goto();
    await this.assertLoaded();
  }

  async goto() {
    await this.step(`Navigate to projects page`, async () => {
      await this.page.goto('/projects');
    });
  }

  async clickNewProjectButton() {
    await this.step('Click "New project" button', async () => {
      await this.newProjectButton.click();
    });
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

  async deleteProject(projectName) {
    await this.step(`Delete project "${projectName}"`, async () => {
      const { deleteButton, confirmDeleteButton } =
        this.getProjectCardActions(projectName);

      await deleteButton.click();
      await confirmDeleteButton.click();
    });
  }

  async clickLogOut() {
    await this.step('Log out', async () => {
      await this.logOutButton.click();
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

  async assertCreateProjectFormVisible() {
    await this.step(
      'Assert "New project" form is visible and "Create" button is disabled',
      async () => {
        await expect(this.newProjectHeading).toBeVisible();

        await expect(this.projectNameInput).toBeVisible();

        await expect(this.cancelCreatingProjectButton).toBeVisible();

        await expect(this.createProjectButton).toBeDisabled();
      },
    );
  }

  async assertProjectCreated(projectName) {
    await this.step(
      `Assert project "${projectName}" is successfully created`,
      async () => {
        await expect(this.getProjectCard(projectName)).toBeVisible();
      },
    );
  }

  async assertProjectDeleted(projectName) {
    await this.step(
      `Assert project "${projectName}" is successfully deleted`,
      async () => {
        await expect(this.getProjectCard(projectName)).toHaveCount(0);
      },
    );
  }
}
