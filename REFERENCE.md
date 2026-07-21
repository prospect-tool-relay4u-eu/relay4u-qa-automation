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

- `login(email, password)`
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

</details>

## Helpers

<details>
<summary><code>helpers/testStep.js</code></summary>

`testStep(title, stepToRun, actorLabel = null)` — thin wrapper around
Playwright's `test.step()`. Used internally by `BasePage.step()`; you
normally call `this.step(...)` from inside a Page Object rather than this
directly.

Also re-exports `expect` from `@playwright/test`, so Page Objects can
`import { expect } from '../helpers/testStep'` instead of
`@playwright/test` directly.

</details>

<details>
<summary><code>helpers/email/getVerificationCode.js</code></summary>

Talks to testmail.app to receive a real verification email during tests.

- `createTestEmail()` → `{ email, tag }`. `email` is a unique inbox
  (`{namespace}.{uuid}@inbox.testmail.app`); use it wherever the test
  needs an email address. Keep `tag` around.
- `getVerificationCode(tag)` — waits for the email tagged `tag` to arrive
  (via testmail.app's `livequery`) and returns the 6-digit code as a
  string.

**Costs one real email per `createTestEmail()` call** — shared 100/month
quota across the team (namespace `2t1jc`). Don't call this in a loop or in
every test; only where the test specifically needs to prove the email flow
works.

Requires `TESTMAIL_API_KEY`, `TESTMAIL_API_URL`, `TESTMAIL_NAMESPACE` in
`.env`.

</details>

## Constants

<details>
<summary><code>helpers/constants/authMessages.js</code></summary>

`AUTH_MESSAGES` — exact strings the app shows for auth-related states
(verified, invalid credentials, password requirements). Import this
instead of hardcoding the string in a Page Object, and match locators with
`{ exact: true }` against it.

Each domain gets its own file (`fieldMessages.js`, `projectMessages.js`,
etc.) instead of one shared file, to avoid merge conflicts between people
working on different areas.

</details>

## Test Data

<details>
<summary><code>helpers/testData/generateNewUser.js</code></summary>

`generateNewUser()` — returns `{ fullName, email, password }` via Faker.
Password always ends in `Aa1!` to guarantee upper/lower/digit/special
regardless of what Faker generates randomly, matching the backend's
complexity requirement.

The `email` field is a throwaway Faker address — if the test needs to
actually receive mail (e.g. registration+verification), override it with
`createTestEmail()`'s `email` before use:

```js
const { email, tag } = createTestEmail();
const user = { ...generateNewUser(), email };
```

</details>

<details>
<summary><code>helpers/testData/existingUser.js</code></summary>

A real, already-verified staging account (`TEST_USER_EMAIL` /
`TEST_USER_PASSWORD` from `.env`). Use this whenever a test just needs "a
logged-in user" and doesn't care how they got there — cheaper than
registering fresh every time.

Don't use it for tests that need a pristine/empty account (e.g. "no
projects yet" empty-state checks) — this account accumulates data from
every test that uses it.

</details>

## Fixtures

Nothing here yet — see `DEVLOG.md` for the planned reused-auth-state
fixture (log in once, reuse the JWT across tests instead of registering
fresh every time).

## Builders

Nothing here yet.
