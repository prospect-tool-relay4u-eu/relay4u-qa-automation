import { expect } from '../../helpers/testStep';
import { BasePage } from '../BasePage';

export class ProjectDetailsPage extends BasePage {
  static urlPattern = /\/projects\/(\d+)$/;

  constructor(page, actorLabel = null) {
    super(page, actorLabel);
    this.pageAnchor = page.getByRole('button', { name: '+ Add record' });
    this.addRecordButton = page.getByRole('button', {
      name: '+ Add record',
    });
    this.tableRows = page.locator('tbody tr');
    this.projectsNavLink = page
      .getByRole('navigation')
      .getByRole('link', { name: 'Projects', exact: true });
    this.columnHeaders = page.getByRole('columnheader');
    this.currentProjectName = page.locator('.breadcrumb-current');
    this.emptyRecordsMessage = page.getByText(
      'No records — click "+ Add record" to get started',
    );
  }

  getRow(rowIndex) {
    return this.tableRows.filter({
      has: this.page.locator('td.td-num', {
        hasText: new RegExp(`^${rowIndex}$`),
      }),
    });
  }

  getCell(rowIndex, columnIndex) {
    return this.getRow(rowIndex).locator('td').nth(columnIndex);
  }

  async openAndAssert() {
    await this.waitForPage();
    await this.assertLoaded();
  }

  async clickAddRecord() {
    await this.step('Click "Add record" button', async () => {
      await this.addRecordButton.click();
    });
  }

  async clickRecordField(rowIndex, columnIndex) {
    await this.step(
      `Click record field in column ${columnIndex}, row "${rowIndex}"`,
      async () => {
        const cell = this.getCell(rowIndex, columnIndex);
        await cell.click();
        await this.page.keyboard.press('Tab');
      },
    );
  }

  async fillRecordField(rowIndex, columnIndex, value) {
    await this.step(
      `Fill record field in column ${columnIndex}, row "${rowIndex}" ` +
        `with "${value}"`,
      async () => {
        const cell = this.getCell(rowIndex, columnIndex);
        await cell.click();
        await cell.getByRole('textbox').fill(value);
        await this.page.keyboard.press('Tab');
      },
    );
  }

  async clickRecordDeleteButton(rowIndex) {
    await this.step(
      `Click "Delete record" button for row "${rowIndex}"`,
      async () => {
        const deleteButton = this.getRow(rowIndex).getByLabel('Delete record');
        await deleteButton.click();
      },
    );
  }

  async clickProjectsNavLink() {
    await this.step('Click "Projects" nav link', async () => {
      await this.projectsNavLink.click();
    });
  }

  async waitForPage() {
    await this.step('Wait for Project Details page to load', async () => {
      await expect(this.page).toHaveURL(ProjectDetailsPage.urlPattern);
    });
  }

  async waitForProject(projectId) {
    await this.step(
      `Wait for Project Details page for project ${projectId}`,
      async () => {
        const projectUrlPattern = new RegExp(`/projects/${projectId}$`);
        await expect(this.page).toHaveURL(projectUrlPattern);
      },
    );
  }

  async assertLoaded() {
    await this.step('Assert Project Details page is loaded', async () => {
      await expect(this.pageAnchor).toBeVisible();
    });
  }

  async assertNewProjectReady(projectName) {
    await this.step(
      `Assert new project "${projectName}" table is ready`,
      async () => {
        await expect(this.columnHeaders.first()).toBeVisible();
        await expect(this.currentProjectName).toHaveText(projectName);
        await expect(this.emptyRecordsMessage).toBeVisible();
      },
    );
  }

  async assertRecordFieldAdded(rowIndex) {
    await this.step(
      `Assert record with row number "${rowIndex}" is added`,
      async () => {
        await expect(this.getRow(rowIndex)).toBeVisible();
      },
    );
  }

  async assertRecordFieldProperValue(rowIndex, columnIndex, expectedValue) {
    await this.step(
      `Expect column ${columnIndex}, row "${rowIndex}" ` +
        `to have "${expectedValue}"`,
      async () => {
        await expect(this.getCell(rowIndex, columnIndex)).toHaveText(
          expectedValue,
        );
      },
    );
  }

  async assertRecordDeleted(rowIndex) {
    await this.step(
      `Assert record with row number "${rowIndex}" is deleted`,
      async () => {
        await expect(this.getRow(rowIndex)).toHaveCount(0);
      },
    );
  }

  async assertColumnsOrder(...columnNames) {
    await this.step(
      `Verify that columns have proper names and order`,
      async () => {
        for (const [index, name] of columnNames.entries()) {
          const header = this.columnHeaders.nth(index);
          await expect(
            header,
            `Column #${index} should be visible`,
          ).toBeVisible();
          await expect(
            header,
            `Column #${index} should have name "${name}"`,
          ).toContainText(name);
        }
      },
    );
  }
}
