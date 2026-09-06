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

   Easiest way to get the exact name: open the scenario's card in
   [Linear.app](https://linear.app), click the "Copy git branch name" icon
   in the top-right corner of the card, and use that directly instead of
   typing it out by hand. One branch per scenario — start a new one before
   picking up the next card.

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

4. Once the scenario works, commit and push with a **short** description
   of what you did (see the commit types table above). Then, before
   opening the PR, update [`DEVLOG.md`](./DEVLOG.md) and, if relevant,
   [`REFERENCE.md`](./REFERENCE.md) — see
   [section 7](#7-keeping-the-docs-updated) for exactly what belongs in
   each.

   ```
   git push -u origin <your-name>/<test-id>-<short-title>
   ```

   Open a Pull Request into `main` and copy your new `DEVLOG.md` entry
   straight into the PR description — it's written for exactly that. Link
   the related Linear ticket(s), and wait for review before merging.

Every time you start a **new** piece of work later on, repeat steps 1-4
from your local `main`:

```
git checkout main
git pull
npm ci
git checkout -b <your-name>/<test-id>-<short-title>

```
 `npm ci` (not `npm install`) does a clean install strictly matching
   `package-lock.json` — it removes `node_modules` first, so you end up
   with exactly the same dependency versions as everyone else, not
   whatever you happened to have installed last week. Only create your
   new branch and start writing once this is done.

### Keep a long-running branch in sync with `main`

If your branch stays open for more than a day or two, other people's
work keeps landing on `main` without you on it — don't wait until you
open the PR to find out how far behind you are. Pull `main` into your
branch at the start of every session you come back to it:

```
git fetch origin
git merge origin/main
```

If Git reports conflicts, resolve them before continuing — they're
almost always easier to fix a few files at a time, right when they
happen, than all at once weeks later in a giant PR. Do this every time
you sit down to work on the branch again, not just once at the start.

If you're not sure whether a specific file you're about to edit has
changed on `main` since you branched off, check before assuming your
copy is current:

```
git log main -- path/to/file.js
```

### How to run tests

```
npm run test
```

**THIS IS THE COMMAND YOU SHOULD RUN DAY TO DAY.** No test currently
sends a real email, so there's nothing to exclude — the plain command
covers the whole suite. See section 8 for why that wasn't always true,
and what changes if it becomes true again.

(Same convention as section 3: the `npm run` script for day-to-day
use, `npx playwright test <path>` directly when you want to target a
single file/folder or pass extra flags.)

Writing or debugging a test and want to interact with it visually?

```
npx playwright test --ui
```

This is safe to use freely — UI Mode does **not** run anything by itself,
it only runs a test once you click it.

---

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

   See "How to run tests" in section 1 above for how to actually run
   the tests.

## 3. Code quality tools

npm scripts (shortcuts, use these day to day):

- `npx playwright codegen https://relay4u-fe-staging-942989865043.europe-west1.run.app/` - A great way to quickly find locators.

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

If a meaningful title pushes the line over 80 characters even after
Prettier formats it (`npx prettier --write`), don't try to restructure
the `test(...)` call to break it across lines — Prettier has a special
formatter for `test`/`it`/`describe` calls and will just collapse it
back to one line every time. Add `// eslint-disable-next-line max-len`
directly above instead:

```js
// eslint-disable-next-line max-len
test('TC-AUTH-009: Some genuinely long, meaningful title', async ({ page }) => {
  ...
});
```

Run Prettier first, though — the title's own line often already fits
once Prettier collapses the call, and the disable comment just becomes
noise (ESLint flags unused disable directives too).

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
- No test currently sends a real email, so `@email-quota` isn't in use
  right now — see section 8 below before reviving
  `TestmailService.createTestEmail()` / `TestmailService.getVerificationCode()`
  in any test, including retagging it `@email-quota` and updating "How
  to run tests" in section 1.

## 6. Writing a Page Object

Page Object inheritance (the `BasePage` pattern, fixed method order,
`openAndAssert()`), API client patterns, and a getting-started guide
for the shared fixtures/`registerAndLoginUser` moved to
[`PATTERNS.md`](./PATTERNS.md) — read that before writing a new Page
Object, API client, or test's `beforeEach`.

## 7. Keeping the docs updated

Three files track the framework as it grows — update whichever apply
**before opening your PR**, as part of finishing the scenario, not as
an afterthought:

- **`DEVLOG.md`** — add a new dated entry
  (`## YYYY-MM-DD HH:MM — short title`) describing what you built and how
  to run/use it. Write it so it can be copy-pasted straight into your PR
  description (see step 4 in section 1).
- **`REFERENCE.md`** — if you added or changed a Page Object, helper, or
  shared constant, add or update its `<details>` entry: what it does, its
  public methods, and any gotchas (cost, edge cases, required env vars).
  If the file already has an entry, keep it accurate — don't leave a stale
  description behind after changing behavior.
- **`PATTERNS.md`** — if you introduced or changed a *pattern* (not
  just one class/method, but a convention future code should follow —
  a new fixture composition style, a new action-layer convention),
  update it too. A one-off helper is a `REFERENCE.md` entry; a
  convention other people are expected to repeat is a `PATTERNS.md`
  one.

These files exist so the next person (teammate or future you) can find
out what already exists and how to use it without re-reading every
diff in the git history.

## 8. `TestmailService` — dormant real-email fallback

Staging used to have no way to get a verification code except a real
email, so `TC-AUTH-001` sent one through testmail.app and polled for
it. Bartosz's staging update added an on-screen "Staging verification
code" popup instead, so every test (including `TC-AUTH-001` now) reads
the code straight off the page via `VerifyEmailPage.getVerificationCode()` —
no email, no third-party service, no quota risk. That's why "How to
run tests" in section 1 is back to the plain `npm run test`.

The old real-email code wasn't deleted — it's parked in
`helpers/email/TestmailService.js` as a self-contained, currently
**unused** service class (`TestmailService.createTestEmail()` /
`TestmailService.getVerificationCode(tag)`; see `REFERENCE.md`). Reason
to keep it: if this framework ever runs against a staging/environment
without the popup, that's the ready-made way to get a code again —
nothing needs to be rebuilt from scratch, and no other file in the
project imports it, so it costs nothing to leave sitting there unused.

**If you ever do wire `TestmailService` back into a test:**

1. Tag that test `@email-quota`, so `npm run test:no-quota` (not the
   plain `npm run test`) becomes the day-to-day command again — update
   "How to run tests" in section 1 to say so.
2. Tell the rest of the team, before merging. Every call sends a real
   email against the shared testmail.app quota — **100 emails/month,
   for everyone combined**. A test quietly drawing on that quota is how
   it gets exhausted without anyone noticing, until it starts failing
   for a reason that has nothing to do with a real bug.
