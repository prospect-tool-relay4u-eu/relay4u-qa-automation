# Framework Reference

What each piece of the automation framework does and how to use it —
Pages, Helpers, Constants, Fixtures, Builders. This is a lookup for things
that **already exist** in the codebase — it is not a backlog and does not
track planned/future work.

When you add a new Page Object, helper, or shared constant: add an entry
here, and drop a one-line pointer at the top of the file itself, e.g.:

```js
// Usage docs: REFERENCE.md#getverificationcode
```

(This isn't a clickable link — GitHub and most editors don't render
markdown links inside code comments. It's just a breadcrumb telling the
next reader where to look.)

---

## Pages

<details>
<summary><code>pages/BasePage.js</code></summary>

Base class every Page Object extends. Provides `this.step(title,
callback)`, which wraps Playwright's `test.step()` so every action shows
up named in the HTML report/trace.

Constructor: `new SomePage(page, actorLabel = null)`. Pass `actorLabel`
(e.g. `'User A'`, or a real name) when a test has more than one actor —
every step for that page gets prefixed, e.g. `User A: Click "Log in"`.

Don't instantiate directly — extend it:

```js
export class SomePage extends BasePage {
  constructor(page, actorLabel = null) {
    super(page, actorLabel);
    // locators here
  }
}
```

</details>

<details>
<summary><code>pages/HomePage.js</code></summary>

The `/` landing page — entry point for both registration and login.

- `goto()` — navigates to `/`
- `clickSignUp()` — clicks "Sign up for free"
- `clickLogIn()` — clicks "I already have an account"
- `assertLoaded()`

</details>

<details>
<summary><code>pages/auth/SignUpPage.js</code></summary>

`/register`. Fills out and submits the registration form.

- `signUp(fullName, email, password)` — fills all four fields and clicks
  "Sign up"
- `assertLoaded()`
- `assertErrorMessage(message)` — asserts the `.alert-error` banner
  contains `message`. Currently the app always shows
  `AUTH_MESSAGES.GENERIC_ERROR` regardless of the real reason — see
  `TC-AUTH-009` (known bug, tracked with `test.fail()`).

</details>

<details>
<summary><code>pages/auth/VerifyEmailPage.js</code></summary>

`/verify-email`. Where the 6-digit code from the registration email gets
entered.

- `verifyEmail(code)` — fills the code and clicks "Verify account"
- `assertLoaded()`

Get `code` from `helpers/email/getVerificationCode.js`.

</details>

<details>
<summary><code>pages/auth/LoginPage.js</code></summary>

`/login`. Also where the "Account verified!" success message shows up
right after email verification.

- `login(email, password)` — waits for the login API response before
  proceeding, to avoid a fake failure when the API is slow to respond
- `assertLoaded()`
- `assertInvalidCredentialsError()` — asserts the generic wrong-credentials
  message
- `assertVerifiedMessage()` — asserts "Account verified! You can now log
  in."

</details>

<details>
<summary><code>pages/ProjectsPage.js</code></summary>

`/projects`. Lands here after a successful login.

- `assertLoaded()` — asserts the "Projects" heading (`exact: true` —
  without it, this also matches the "No projects yet" empty-state
  heading)
- `assertUserNameDisplayed(fullName)` — asserts the logged-in user's name
  is shown
- `clickFormCreateNewProject()` — opens the "New project" form
- `assertCreateProjectFormVisible()` — asserts the form is visible and
  "Create" button is disabled
- `fillProjectNameField(name)`
- `clickCreateProject()`
- `assertProjectCreated(name)` — can occasionally time out (even at 30s)
  when the create-project API response lags; not a real failure if seen
  intermittently
- `deleteProject(name)`

<details>
<summary><code>pages/ProjectDetailsPage.js</code></summary>

`/projects/:id`. An opened, editable project — the record table plus
field management.

**Row/column indexing:** `rowIndex` is the visible row number shown in
the `#` column (matched against `td.td-num` text), not an array index.
`columnIndex` is zero-based across all `<td>` in that row, left to right
(`0` = `#`, `1` = first data column, etc.)

- `waitForPage()` — waits for the URL to match `/projects/:id`
- `waitForProject(projectId)` — waits for the URL to match a specific
  project id
- `assertLoaded()` — asserts page is loaded
- `clickAddRecord()`
- `assertRecordFieldAdded(rowIndex)` — asserts a row with that visible
  number has been added
- `clickRecordField(rowIndex, columnIndex)` — clicks the cell, then
  presses `Tab` to commit the value (the app saves on blur — skipping
  the `Tab` can leave the value unsaved)
- `fillRecordField(rowIndex, columnIndex, value)` — clicks the cell,
  fills its textbox, then presses `Tab` to commit the value (the app
  saves on blur — skipping the `Tab` can leave the value unsaved)
- `assertRecordFieldProperValue(rowIndex, columnIndex, expectedValue)`
- `clickRecordDeleteButton(rowIndex)` — deletes the entire record row
- `assertRecordDeleted(rowIndex)` — asserts the row no longer exists
- `assertColumnsOrder(...columnNames)` — asserts column headers match
  names and order, left to right (`0` = `#`)
- `clickProjectsNavLink()` — clicks 'Projects' navigation button

**Internal:** `getRow(rowIndex)` / `getCell(rowIndex, columnIndex)` build
the locators above — not meant to be called directly from tests.

</details>

---

## Fixtures

<details>
<summary><code>fixtures/authFixtures.js</code></summary>

Extends Playwright's base `test` with a `loggedInPage` fixture — logs in
automatically before the test body runs, so tests don't need to repeat
login steps themselves.

```js
import { test } from '../fixtures/authFixtures';

test('some scenario', async ({ loggedInPage }) => {});
```

</details>

---

## Builders

Nothing here yet.
