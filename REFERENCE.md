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

- `getVerificationCode()` — reads the code straight off this staging
  environment's on-screen "Staging verification code" popup
  (`.staging-code-popup-code`), no email needed. This page has no
  knowledge of `TestmailService` (see `Helpers` below) — a test that
  needs the real-email fallback calls that class directly instead.
- `verifyEmail(code)` — fills the code and clicks "Verify account"
- `assertLoaded()`

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

## API clients

Mirror Page Objects, but for API testing: a `BaseAPI` parent, extended
by domain-specific clients (e.g. `AuthAPI`). Constructed with
Playwright's `request` fixture (`APIRequestContext`), not `page`.

<details>
<summary><code>api/BaseAPI.js</code></summary>

Base class every API client extends. Constructor: `new SomeAPI(request,
actorLabel = null)`.

- `this.step(title, callback)` — same purpose as `BasePage.step()`:
  wraps `test.step()` so the call shows up named in the report/trace
- `parseStatus(response)` — `response.status()`
- `parseBody(response)` — `await response.json()`

</details>

<details>
<summary><code>api/auth/AuthAPI.js</code></summary>

Talks to the auth backend directly
(`relay4u-auth-be-staging-....run.app`) — a separate host from the
frontend's `BASE_URL`, not something `request.post('/api/...')` would
reach on its own.

Low-level (one HTTP call each, return the raw response):

- `register(user)` — `POST /api/auth/register`
- `verifyEmail(email, code)` — `POST /api/auth/verify-email`
- `login(email, password)` — `POST /api/auth/login`

Composed (call the above, assert/parse, return only what the caller
needs):

- `createNewUser(user)` — registers, asserts `201`, pulls
  `verificationCode` straight off the register response (this
  staging's convenience field), then verifies the email
- `assertSuccessfulCreation(response)` — asserts `200`
- `loginUser(user)` — logs in, asserts `200`, returns the JWT `token`
  string from the response body

</details>

---

## Helpers

<details>
<summary><code>helpers/decodeJwt.js</code></summary>

Standalone functions, not tied to any class on purpose — meant to grow
into a general response-decoding helper (other response shapes:
tables, projects, etc.), not just auth/JWT.

- `decodeJwtHeader(token)` — splits the JWT, base64url-decodes the
  header segment, returns the parsed JSON object
- `assertJwtHeaderAlgorithm(token, algorithm)` — asserts
  `decodeJwtHeader(token).alg === algorithm`

</details>

<details>
<summary><code>helpers/email/TestmailService.js</code></summary>

**Currently unused** — no test imports this. Kept as a dormant,
self-contained fallback for a future staging/environment that has no
on-screen verification-code shortcut (right now, every test reads the
code via `VerifyEmailPage.getVerificationCode()` instead — see above).
Nothing else in the project imports this file, so deleting it would
change nothing about how the suite currently runs.

Static-method service class wrapping the testmail.app API — no
instance is ever created, call both methods directly on the class:

- `TestmailService.createTestEmail()` — returns `{ email, tag }`;
  `email` is a unique `<namespace>.<tag>@inbox.testmail.app` address,
  `tag` is what you poll for
- `TestmailService.getVerificationCode(tag)` — polls testmail.app for
  the email sent to that tag and extracts the 6-digit code from its
  body

**Before reviving it in any test:** every call sends a real email
against a shared testmail.app quota — **100 emails/month, for everyone
combined**. See `CONTRIBUTING.md` section 8 for the checklist (tag the
test `@email-quota`, tell the team, switch back to
`npm run test:no-quota`).

</details>

---

## Actions

Standalone functions combining multiple Page Objects/API clients into
one named business step — the `ui/actions/*` idea from the academy
material. They build their own Page Object/API client instances
internally from raw `page`/`request`, instead of taking
already-constructed ones, so a caller only needs the bare fixtures.

<details>
<summary><code>actions/auth/registerAndLoginUser.js</code></summary>

Two interchangeable variants of the same outcome — a freshly
registered, logged-in user with a real browser session — both with the
identical signature `(page, request, user, actorLabel = null)`, so a
caller can swap one for the other without changing anything else:

- `registerAndLoginUser.viaApi(...)` — registers/verifies through
  `AuthAPI` (fast, relies on this staging's convenience
  `verificationCode` field), then logs in for real through `LoginPage`
  so the browser gets an actual session — an API login alone returns a
  token but sets nothing in the browser, so it can't carry a UI test
  on its own.
- `registerAndLoginUser.viaUi(...)` — the fully manual path: signs up
  through `SignUpPage`, reads the code off `VerifyEmailPage`'s staging
  popup, verifies, then logs in. Doesn't touch `request`/`AuthAPI` at
  all. Portability note: on an environment without the staging popup,
  swap `verifyEmailPage.getVerificationCode()` for
  `TestmailService.getVerificationCode(tag)` (see
  `helpers/email/TestmailService.js` — currently unused, kept for
  exactly this case) and generate the user's email via
  `TestmailService.createTestEmail()` instead of `generateNewUser()`'s
  plain one.

Both end on `projectsPage.assertLoaded()`, confirming the whole chain
actually landed the user somewhere real.

</details>

---

## Fixtures

<details>
<summary><code>fixtures/fixtures.js</code></summary>

The one to import from in test files. Merges every fixture file below
via Playwright's `mergeTests`, so adding a new fixture file later
doesn't require touching every test's import line.

```js
import { test } from '../fixtures/fixtures';
```

</details>

<details>
<summary><code>fixtures/authFixtures.js</code></summary>

- `loginPage` — constructs a `LoginPage`, nothing more
- `authApi` — constructs an `AuthAPI`, nothing more

Both are deliberately "dumb" fixtures (no side effects) — no
login/API call happens inside fixture setup, so it stays a plain call
in the test body or `beforeEach()` instead of being hidden inside a
fixture that already assumes one fixed flow. That keeps things
extensible — a spec needing two logged-in actors, or a different user
per test, isn't fighting a fixture that already decided how login
works.

```js
import { test } from '../fixtures/fixtures';

test.beforeEach(async ({ loginPage }) => {
  await loginPage.openAndAssert();
  await loginPage.login(existingUser.email, existingUser.password);
});

test('some scenario', async ({ page }) => {});
```

</details>

<details>
<summary><code>fixtures/userFixtures.js</code></summary>

- `user` — `generateNewUser()` handed straight to the test, nothing
  more (same "dumb fixture" rule as above)

</details>

---

## Builders

Nothing here yet.
