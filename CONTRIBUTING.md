# Contributing to relay4u-qa-automation

This document explains how to get the project running locally and the
conventions used across the codebase. Read this before writing your first
test.

## 1. Clone & create your branch

Do this first, before installing anything — we never work directly on
`main`, so your branch should exist before you touch any files.

1. Clone the repository:

   ```
   git clone https://github.com/prospect-tool-relay4u-eu/relay4u-qa-automation.git

   ```

2. Create your own branch off `main`, named like this:

   ```
   <your-name>/<test-id>-<short-title>
   ```

   Example:

   ```
   git checkout -b anton/tc-auth-002-login
   ```

   Your name first, then the test case ID you're working on, then a short
   title — this makes it obvious from the branch list who is working on
   what.

3. Commit your work as you go, using [Conventional Commits](https://www.conventionalcommits.org/):

   ```
   type: short summary

   - detail 1
   - detail 2
   ```

   Types in use — what each one means and when to use it:

   | Type       | Use it for                                                                                 |
   | ---------- | ------------------------------------------------------------------------------------------ |
   | `feat`     | A new capability: a new test, a new Page Object, a new fixture/helper.                     |
   | `fix`      | Fixing something that was broken in the framework/test code itself.                        |
   | `chore`    | Infrastructure/routine work that isn't a feature or a fix — config, deps, scaffolding.     |
   | `test`     | Changes limited to test files (e.g. adjusting assertions) without touching framework code. |
   | `docs`     | Documentation-only changes (README, this file, code comments).                             |
   | `ci`       | Changes to the CI/CD pipeline (`.github/workflows`).                                       |
   | `refactor` | Restructuring existing code without changing its behavior.                                 |

   Apply the same format to PR titles. Two short examples:

   ```
   feat: add LoginPage and TC-AUTH-002 login test
   ```

   ```
   fix: correct HomePage log in link locator
   ```

4. Push your branch and open a Pull Request into `main`:

   ```
   git push -u origin <your-name>/<test-id>-<short-title>
   ```

   Write a PR description that summarizes what changed since the previous
   PR/checkpoint — what was added, what's still blocked, anything the
   reviewer should pay attention to. Link the related Linear ticket(s) if
   applicable, and wait for review before merging.

Every time you start a **new** piece of work later on, repeat steps 1-4
from your local `main`:

```
git checkout main
git pull
git checkout -b <your-name>/<test-id>-<short-title>
```

## 2. Local setup

1. Install dependencies:

   ```
   npm install
   ```

   `npm install` also registers the Husky pre-commit hook automatically
   (via the `prepare` script).

2. Create your local `.env` file from the template:

   ```
   cp .env.example .env
   ```

   Fill in the real values yourself. `.env` is git-ignored — it is never
   committed, and each engineer keeps their own copy locally. Never put
   real credentials into `.env.example`, only placeholders.

3. Install browsers (usually a no-op if already installed):

   ```
   npx playwright install
   ```

4. Run the tests:

   ```
   npx playwright test          # headless, all browsers
   npx playwright test --ui     # interactive UI mode, recommended while writing tests
   npx playwright test --debug  # step-by-step with Playwright Inspector
   ```

## 3. Code quality tools

npm scripts (shortcuts, use these day to day):

- `npm run lint` — check code with ESLint (includes `eslint-plugin-playwright`
  rules, e.g. no `page.waitForTimeout()`, no `page.pause()` left in committed
  code).
- `npm run lint:fix` — auto-fix what ESLint can.
- `npm run format` — format everything with Prettier.
- `npm run format:check` — check formatting without changing files.

These npm scripts are thin wrappers around the underlying CLI tools. If you
ever need to run them directly (e.g. against a single file or folder):

- `npx eslint .` — same as `npm run lint`, runs ESLint against the whole
  project. Replace `.` with a specific path (e.g. `npx eslint tests/auth`)
  to lint only that folder.
- `npx prettier . --check` — same as `npm run format:check`, reports which
  files are not formatted correctly without touching them.
- `npx prettier . --write` — same as `npm run format`, rewrites every file
  in place to match the Prettier style.

A Husky pre-commit hook runs `lint-staged` automatically on every commit,
which lints and formats only the files you changed. If it blocks your
commit, fix the reported issue and commit again — do not bypass it with
`--no-verify`.

## 4. Project structure

| Folder                 | Purpose                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| `tests/auth/`          | Authentication flows: registration, login, tokens (`TC-AUTH-*`)        |
| `tests/security/`      | Security tests: IDOR, injection, isolation (`TC-SEC-*`, `TC-ISOL-*`)   |
| `tests/crud/projects/` | Project CRUD (`TC-PROJ-*`)                                             |
| `tests/crud/fields/`   | Project field CRUD (`TC-FIELD-*`)                                      |
| `tests/crud/records/`  | Prospect record CRUD (`TC-REC-*`)                                      |
| `tests/performance/`   | Load/performance-related Playwright tests (`TC-PERF-*`)                |
| `tests/db/`            | Tests that assert on database state (`TC-DB-*`)                        |
| `tests/e2e/`           | Composite, multi-domain user journeys (e.g. smoke/regression flows)    |
| `pages/`               | Page Object classes — one class per screen                             |
| `fixtures/`            | Playwright custom fixtures (auth state, multi-user setup, etc.)        |
| `helpers/builders/`    | Test data builders for API-created resources (projects, records, etc.) |
| `helpers/testData/`    | Static and generated test data (users, etc.)                           |
| `k6/`                  | Load test scripts, run separately from `npm test` (not npm-based)      |
| `features/`            | BDD/Gherkin `.feature` files (not wired to a runner yet)               |
| `postman/`             | Exported Postman collections                                           |

Empty folders contain a `.gitkeep` placeholder so the structure is visible
on GitHub even before real files land in them — delete the `.gitkeep` once
you add a real file to that folder.

## 5. Writing a test

### File naming

`tests/<suite>/tc-<suite>-<number>-<short-description>.spec.js`

Example: `tests/auth/tc-auth-002-login.spec.js`

### Test title

Start the title with the test case ID, matching the master test plan /
Linear ticket:

```js
test('TC-AUTH-002: Login with valid credentials returns JWT', async ({ page }) => {
  ...
});
```

### Code style inside a test body

Group statements by kind and separate each group with a blank line:
declarations first, then actions, then assertions — repeat this pattern
for each phase of the test (e.g. once per page you navigate through).

```js
const user = generateNewUser();
const homePage = new HomePage(page);
const signUpPage = new SignUpPage(page);

await homePage.goto();
await homePage.clickSignUp();

await signUpPage.assertLoaded();

await signUpPage.signUp(user.fullName, user.email, user.password);
```

### Other rules

- Every test must be independent — do not rely on state left behind by
  another test.
- Use `async`/`await` everywhere, never `.then()`.
- Never use `page.waitForTimeout()` — wait on a real condition instead
  (`expect(locator).toBeVisible()`, `page.waitForURL()`, etc.). ESLint
  will warn if you do.
- Tag tests where relevant: `@smoke`, `@regression`, `@security`, `@idor`,
  `@crud` (append to the test title, e.g. `'TC-SEC-001: ... @security'`).

## 6. Writing a Page Object

Each page is a plain JS class in `pages/`. Constructor takes the Playwright
`page` and stores locators as readonly-by-convention fields; add one method
per user action, plus an `assertLoaded()` method anchored to something
unique to that page:

```js
import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.logInButton = page.getByRole('button', { name: 'Log in' });
    this.pageAnchor = page.getByRole('heading', { name: 'Log in' });
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.logInButton.click();
  }

  async assertLoaded() {
    await expect(this.pageAnchor).toBeVisible();
  }
}
```

Prefer `getByRole` / `getByLabel` / `getByPlaceholder` locators over CSS
selectors — they are more resistant to markup changes. If you're unsure
what a locator should be, run `npx playwright codegen <url>` and interact
with the page manually; it generates the locator code for you.
