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

  async clickCreateProject() {
    await this.page.getByRole('button', { name: '+ New project' }).click();
  }

  async assertCreateProjectFormVisible() {
    const projectModal = this.page.locator('div', {
      has: this.page.getByRole('heading', { name: 'New project' }),
    });

    await expect(
      projectModal.getByRole('heading', { name: 'New project' }),
    ).toBeVisible();

    await expect(
      projectModal.getByRole('textbox', { name: 'Project name' }),
    ).toBeVisible();

    await expect(
      projectModal.getByRole('button', { name: 'Cancel' }),
    ).toBeVisible();

    await expect(
      projectModal.getByRole('button', { name: 'Create project' }),
    ).toBeDisabled();
  }

  async fillProjectNameField(projectName) {
    await this.page
      .getByRole('textbox', { name: 'Project name' })
      .fill(projectName);
  }

  async clickFormCreateNewProject() {
    await this.page.getByRole('button', { name: 'Create project' }).click();
  }

  async assertProjectCreated() {
    await expect(this.page.locator('div.table-page')).toBeVisible();
  }
}
