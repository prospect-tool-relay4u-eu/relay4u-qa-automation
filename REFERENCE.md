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

Also declares `openAndAssert()`, which throws by default
(`openAndAssert() is not implemented for SomePage`). Every Page Object
that has a real, directly-navigable entry point overrides it with its
own `goto()` + `assertLoaded()` (or `waitForPage()` + `assertLoaded()`
for pages reached via a dynamic URL, like `ProjectDetailsPage`) — one
call that lands on the page and confirms it actually loaded, instead of
callers doing both steps by hand every time.

</details>

<details>
<summary><code>pages/HomePage.js</code></summary>

The `/` landing page — entry point for both registration and login.

- `openAndAssert()` — `goto()` + `assertLoaded()`
- `goto()` — navigates to `/`
- `clickSignUp()` — clicks "Sign up for free"
- `clickLogIn()` — clicks "I already have an account"
- `assertLoaded()`

</details>

<details>
<summary><code>pages/auth/SignUpPage.js</code></summary>

`/register`. Fills out and submits the registration form.

- `openAndAssert()` — `goto()` + `assertLoaded()`
- `goto()` — navigates to `/register`
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

- `openAndAssert()` — `goto()` + `assertLoaded()`
- `goto()` — navigates to `/login`
- `login(email, password)` — waits for the login API response before
  proceeding, to avoid a fake failure when the API is slow to respond
- `assertLoaded()`
- `assertInvalidCredentialsError()` — asserts the generic wrong-credentials
  message
- `assertVerifiedMessage()` — asserts "Account verified! You can now log
  in."

</details>

<details>
<summary><code>pages/projects/ProjectsPage.js</code></summary>

`/projects`. Lands here after a successful login — no `goto()` needed
right after `login()`, the app redirects here on its own; just call
`assertLoaded()` (or use `openAndAssert()` when arriving from anywhere
else, e.g. test cleanup in `afterEach`).

- `openAndAssert()` — `goto()` + `assertLoaded()`
- `assertLoaded()` — asserts the "Projects" heading (`exact: true` —
  without it, this also matches the "No projects yet" empty-state
  heading)
- `assertUserNameDisplayed(fullName)` — asserts the logged-in user's name
  is shown
- `clickNewProjectButton()` — opens the "New project" form
- `assertCreateProjectFormVisible()` — asserts the form is visible and
  "Create" button is disabled
- `fillProjectNameField(name)`
- `clickCreateProjectButton()` — submits the form
- `assertProjectCreated(name)`
- `deleteProject(name)`
- `assertProjectDeleted(name)`
- `clickLogOut()`

**Internal:** `getProjectCard(projectName)` returns the Locator for one
project's card, filtered by its visible name — reused by
`assertProjectCreated`/`assertProjectDeleted`/`deleteProject` instead of
each rebuilding the same filter separately.

`getProjectCardActions(projectName)` builds on `getProjectCard` and
returns an object with that card's action buttons, instead of a single
Locator:

```js
getProjectCardActions(projectName) {
  const card = this.getProjectCard(projectName);

  return {
    deleteButton: card.getByRole('button', { name: 'Delete project', exact: true }),
    confirmDeleteButton: card.getByRole('button', { name: 'Yes, delete', exact: true }),
  };
}
```

`deleteProject()` then does:

```js
const { deleteButton, confirmDeleteButton } =
  this.getProjectCardActions(projectName);

await deleteButton.click();
await confirmDeleteButton.click();
```

What `const { deleteButton, confirmDeleteButton } = ...` means: this is
called **object destructuring**. The general idea, in plain terms:
`this.getProjectCardActions(projectName)` runs and hands back a
reference to one object sitting in memory — think of it as a box with
labeled compartments (`deleteButton`, `confirmDeleteButton`, could be
any number of them). Destructuring reaches into that box by label and
pulls specific compartments out into their own standalone variables,
in one step, instead of you doing it by hand one property at a time.

`getProjectCardActions()` returns exactly that kind of object — one
object with two properties on it. Instead of writing:

```js
const actions = this.getProjectCardActions(projectName);
const deleteButton = actions.deleteButton;
const confirmDeleteButton = actions.confirmDeleteButton;
```

destructuring does the exact same thing in one line — it pulls each
named property straight out into its own variable, matched by name
(the names on the left, `deleteButton`/`confirmDeleteButton`, have to
match the property names on the object being destructured — that's
how it knows what to grab). Nothing more advanced is happening here
than that.

</details>

<details>
<summary><code>pages/projects/ProjectDetailsPage.js</code></summary>

`/projects/:id`. An opened, editable project — the record table plus
field management.

**Row/column indexing:** `rowIndex` is the visible row number shown in
the `#` column (matched against `td.td-num` text), not an array index.
`columnIndex` is zero-based across all `<td>` in that row, left to right
(`0` = `#`, `1` = first data column, etc.)

- `openAndAssert()` — `waitForPage()` + `assertLoaded()` (no `goto()`
  here — the URL is dynamic per project id, so there's nothing to
  navigate to directly; you land here by clicking through)
- `waitForPage()` — waits for the URL to match `/projects/:id`
- `waitForProject(projectId)` — waits for the URL to match a specific
  project id
- `assertLoaded()` — asserts page is loaded
- `assertNewProjectReady(projectName)` — the check right after creating
  a project: the `#` column header is visible (table has rendered), the
  breadcrumb (`.breadcrumb-current`) shows `projectName`, and the
  empty-state row (`No records — click "+ Add record" to get started`)
  is visible. Anchoring on the `#` header first avoids a race where the
  breadcrumb/empty-state text is checked before the table has actually
  rendered.
- `clickAddRecord()`
- `assertRecordFieldAdded(rowIndex)` — asserts a row with that visible
  number has been added
- `clickRecordField(rowIndex, columnIndex)` — clicks the cell, then
  presses `Tab` to commit the value and waits for the save request to
  complete (see `waitForRecordSaved()` below)
- `fillRecordField(rowIndex, columnIndex, value)` — clicks the cell,
  fills its textbox, then presses `Tab` to commit the value and waits
  for the save request to complete (see `waitForRecordSaved()` below)
- `assertRecordFieldProperValue(rowIndex, columnIndex, expectedValue)`
- `clickRecordDeleteButton(rowIndex)` — deletes the entire record row
- `assertRecordDeleted(rowIndex)` — asserts the row no longer exists
- `assertColumnsOrder(...columnNames)` — asserts column headers match
  names and order, left to right (`0` = `#`)
- `clickProjectsNavLink()` — clicks 'Projects' navigation button

**Internal:** `getRow(rowIndex)` / `getCell(rowIndex, columnIndex)` build
the locators above — not meant to be called directly from tests.

**Internal:** `waitForRecordSaved()` waits for the record's `PUT
/api/records/:id` response. The app saves the whole row's `values`
object on every field blur, not one field at a time — so editing two
fields back to back without waiting can send two overlapping `PUT`
requests, and if they land out of order, whichever one arrives last
wins and can silently wipe out the field the other one had just
saved. `clickRecordField`/`fillRecordField` both press `Tab` (which
triggers the save) and `waitForRecordSaved()` (armed *before* `Tab`,
so a fast response can't resolve before Playwright starts listening
for it) together, so the next action in the test never starts before
the current field's save has actually landed on the backend.

What `for (const [index, name] of columnNames.entries())` means,
inside `assertColumnsOrder`:

```js
for (const [index, name] of columnNames.entries()) {
  const header = this.columnHeaders.nth(index);
  // ...
}
```

`columnNames` is an array (that's what `...columnNames` collects —
every argument the caller passed in, e.g. `'#'`, `'Full Name'`,
`'Company'`, ...). A plain `for (const name of columnNames)` would
hand you each value one at a time, but not its position — and here we
need the position too, to know which header on the page (`0` = `#`,
`1` = the next one, and so on) each name should be checked against.

`.entries()` is a built-in array method that turns `['#', 'Full
Name', ...]` into a sequence of `[index, value]` pairs: `[0, '#']`,
`[1, 'Full Name']`, and so on — position and value bundled together.

`[index, name]` in the loop is **array destructuring** — the same
idea as the object destructuring explained above, just matched by
*position* instead of by name. Each `[index, value]` pair coming out
of `.entries()` gets unpacked on the spot: the first slot goes into
`index`, the second into `name`. That's what lets the loop body use
`this.columnHeaders.nth(index)` to grab the right header element and
compare it against `name`, for every column, in one pass.

</details>

---

## Fixtures

<details>
<summary><code>fixtures/authFixtures.js</code></summary>

Extends Playwright's base `test` with a `loginPage` fixture — just
constructs a `LoginPage` instance and hands it to the test, nothing
more. It does **not** log in for you: the fixture is deliberately
"dumb" (no side effects), so login stays a plain call in
`test.beforeEach()` inside each spec file instead of being hidden
inside fixture setup. That keeps things extensible — a spec that needs
two logged-in actors, or a different user per test, isn't fighting a
fixture that already assumes one fixed login flow.

```js
import { test } from '../fixtures/authFixtures';

test.beforeEach(async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login(existingUser.email, existingUser.password);
});

test('some scenario', async ({ page }) => {});
```

</details>

---

## Builders

Nothing here yet.
