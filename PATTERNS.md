# Framework Patterns

How to write idiomatic code in this framework — architecture patterns
and a getting-started walkthrough for fixtures/actions. For local
setup, git workflow, and commit conventions, see
[`CONTRIBUTING.md`](./CONTRIBUTING.md). For a lookup of what already
exists (classes, methods, fixtures), see
[`REFERENCE.md`](./REFERENCE.md).

---

<details>
<summary><strong>Page Objects</strong></summary>

Each page is a plain JS class in `pages/` (or a domain subfolder —
`pages/auth/`, `pages/projects/` — once there's more than one or two
pages for that area), **extending `BasePage`**. Constructor takes the
Playwright `page` and an optional `actorLabel`, and stores locators as
readonly-by-convention fields. **Wrap every action and assertion in
`this.step(title, callback)`** — inherited from `BasePage` — so it shows
up named in the HTML report/trace.

**Method order inside the class is fixed — always the same four groups,
in this order, with no comments labeling them (the order alone is the
documentation):**

1. **Constructor** — every *static* locator (one that doesn't depend on
   a parameter) as a field.
2. **Floating locators** — methods that build a `Locator` dynamically
   from a parameter, e.g. `#getRow(rowIndex)`, `#getCell(rowIndex,
   columnIndex)`. These exist because the locator can't be built once in
   the constructor — it needs an argument only known at call time. If
   nothing outside the class ever needs to call one directly, make it
   `#private` (see below) — see `#getProjectCard(projectName)` /
   `#getProjectCardActions(projectName)` in `REFERENCE.md` under
   `pages/projects/ProjectsPage.js` for a worked example, including why
   one of them returns an object of Locators instead of a single one.
3. **`openAndAssert()`**, if the page has one — see below.
4. **Actions**, then **assertions** — one method per user action, plus
   an `assertLoaded()` method anchored to something unique to that page.

```js
import { expect } from '../helpers/testStep';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page, actorLabel = null) {
    super(page, actorLabel);
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.logInButton = page.getByRole('button', { name: 'Log in' });
    this.pageAnchor = page.getByRole('heading', { name: 'Log in' });
  }

  async openAndAssert() {
    await this.goto();
    await this.assertLoaded();
  }

  async goto() {
    await this.step(`Go to login page`, async () => {
      await this.page.goto('/login');
    });
  }

  async login(email, password) {
    await this.step(`Fill "Email" with "${email}"`, async () => {
      await this.emailInput.fill(email);
    });

    await this.step(`Fill "Password" with "${password}"`, async () => {
      await this.passwordInput.fill(password);
    });

    await this.step(`Click "Log in"`, async () => {
      await this.logInButton.click();
    });
  }

  async assertLoaded() {
    await this.step(`Assert login page is loaded`, async () => {
      await expect(this.pageAnchor).toBeVisible();
    });
  }
}
```

This is a hard rule, not a style preference — a new Page Object method
that doesn't use `this.step()` should get a "Request changes" in review.
See `REFERENCE.md` under `pages/BasePage.js` for the full API, including
`actorLabel` (for multi-user tests).

**`openAndAssert()`** — `BasePage` declares it and throws by default
(`openAndAssert() is not implemented for X`). Override it on any page
that has a real, directly-reachable entry point: `goto()` +
`assertLoaded()` for a page with a fixed URL (like `/login` above), or
`waitForPage()` + `assertLoaded()` for a page reached via a dynamic URL
(e.g. `ProjectDetailsPage`, at `/projects/:id` — there's nothing to
`goto()` directly, you land there by clicking through). One call that
lands on the page and confirms it actually loaded, instead of every
caller doing both steps by hand — and it means you never need a bare
`goto()` sitting alone in a test right before an `assertLoaded()` call.
Skip it on pages with no standalone entry point of their own (e.g.
`VerifyEmailPage`, only ever reached mid-flow with a real pending
verification code — navigating there directly isn't a meaningful
scenario).

Prefer `getByRole` / `getByLabel` / `getByPlaceholder` locators over CSS
selectors — they are more resistant to markup changes. If you're unsure
what a locator should be, run `npx playwright codegen <url>` and interact
with the page manually; it generates the locator code for you.

</details>

---

<details>
<summary><strong>Private class members (<code>#private</code>)</strong></summary>

Use real private fields/methods (`#name`), not the `_underscore`
naming convention, for anything a **leaf class** never needs to expose
outside itself — a raw low-level method, a locator-building helper
only used by that class's own actions/assertions, an internal field
like a base URL. Real `#` privacy is enforced by the language: nothing
outside the class can call it, even by accident, which a leading
underscore only ever signals and never enforces.

```js
export class AuthAPI extends BaseAPI {
  #baseUrl;

  constructor(request, actorLabel = null) {
    super(request, actorLabel);
    this.#baseUrl = '...';
  }

  async #register(user) {
    /* raw POST /api/auth/register — never called outside this class */
  }

  async createNewUser(user) {
    // the only entry point a test/action can actually call
    const response = await this.#register(user);
    // ...
  }
}
```

**Only do this on leaf classes** — a class nothing else extends.
`BasePage`/`BaseAPI` themselves must stay fully public: `this.step()`,
`this.request`, `this.page`, `this.actorLabel` are exactly the members
every subclass's own methods need to call via `this`. A real `#field`
declared in a parent class isn't reachable from a subclass's methods
at all — using `#` there would silently break every Page
Object/API client that extends it.

**Locators stay public on purpose** — even the ones only used
internally (`this.emailInput`, etc.). They're occasionally worth
reaching for a quick check in the trace viewer or a one-off debug
assertion, and the actual risk of someone bypassing an action method
to click a locator directly is low-value to guard against. Compare
that to a raw API method: skip the composed method and you skip the
status assertion, silently. That's the risk `#private` on API clients
is actually there to prevent — see `AuthAPI` in `REFERENCE.md`, and
`#getProjectCard`/`#getRow`/`#getCell`/`#waitForRecordSaved` in the
`projects/` Page Objects for the equivalent case on leaf Page Objects.

</details>

---

<details>
<summary><strong>API clients</strong></summary>

Same idea as Page Objects, but for API testing: a plain JS class in
`api/` (or a domain subfolder — `api/auth/`), **extending `BaseAPI`**.
Constructor takes Playwright's `request` (`APIRequestContext`) and an
optional `actorLabel`, same signature shape as `BasePage`.

Layer low-level and composed methods, same as `AuthAPI` does:

- **Low-level** — one HTTP call, return the raw response. No
  assertions, no parsing. `#private` on a leaf class (see "Private
  class members" above) — a test skipping straight to a raw HTTP call
  skips the status assertion with it, so don't leave the door open.
- **Composed** — call the low-level methods, assert the status,
  parse the body, and return only what the caller actually needs. This
  is what test bodies should call — a test should never see a raw
  `response` object or call `expect(response.status())` inline.

See `REFERENCE.md` under `api/BaseAPI.js` / `api/auth/AuthAPI.js` for
the concrete methods.

</details>

---

<details>
<summary><strong>Getting started: fixtures and <code>registerAndLoginUser</code></strong></summary>

Every test imports `test` (and `expect`, for API tests) from the
collector fixture — not `@playwright/test` directly, and not any single
domain fixture file:

```js
import { test } from '../../fixtures/fixtures';
```

`fixtures/fixtures.js` merges every domain fixture file
(`authFixtures.js`, `userFixtures.js`, ...) via Playwright's
`mergeTests`. Adding a new fixture later means adding a new file and
merging it in there — not touching every test's import line.

**A fixture must stay "dumb" — this is a hard rule, not a style
preference.** A fixture body only constructs something and hands it to
`use()` — no API calls, no UI actions, no assertions, no business logic
of any kind:

```js
authApi: async ({ request }, use) => {
  const authApi = new AuthAPI(request);

  await use(authApi);
},
```

Why: a fixture that already assumes one fixed flow (e.g. "this fixture
always logs in as X") is exactly what breaks the moment a scenario
needs something different — a second actor, a different user per
test, a parameterized value. Keep construction in the fixture; put the
actual behavior (login, registration, ...) in a plain function that
*takes* the constructed thing as a parameter instead — that's what
`registerAndLoginUser` below is for. If you can't reuse a fixture
as-is for a two-actor or parameterized test, it has too much logic in
it.

**Fixtures currently available** (see `REFERENCE.md` for the full
list):

- `user` — a fresh `generateNewUser()` object, unique per test
- `loginPage` — a `LoginPage` instance, nothing more (dumb fixture — no
  login performed for you)
- `authApi` — an `AuthAPI` instance, nothing more (dumb fixture — no
  request performed for you)
- `page`, `request` — Playwright's own

**Getting a logged-in user as a precondition:** don't write the
register → verify → login sequence by hand in a test's `beforeEach`.
Use `registerAndLoginUser` (`actions/auth/registerAndLoginUser.js`)
instead — two variants, same outcome, **not** the same signature (each
takes only what it actually needs):

```js
test.beforeEach(async ({ page, request, user }) => {
  await registerAndLoginUser.viaApi(page, request, user);
});
```

- **`.viaApi(page, request, user, actorLabel)`** — the default choice
  for most tests. Registers and verifies through `AuthAPI` (fast — a
  couple of HTTP calls, no UI), then logs in for real through
  `LoginPage` so the browser ends up with an actual session. (An
  API-only login returns a token but sets nothing in the browser, so
  it can't carry a UI test on its own — this is why the login step
  still goes through the real form.)
- **`.viaUi(page, user, actorLabel)`** — no `request` parameter; it
  never touches `AuthAPI`. Use it when the scenario specifically needs
  to exercise the real sign-up UI, or as a fallback for an environment
  with no API shortcut for the verification code (see
  `TestmailService` in `REFERENCE.md`).

Both variants end on `projectsPage.assertLoaded()` — after either call,
the test body can go straight into UI interaction, already logged in.

**A minimal new UI test**, precondition included:

```js
import { test } from '../../fixtures/fixtures';
import { registerAndLoginUser } from '../../actions/auth/registerAndLoginUser';

test.beforeEach(async ({ page, request, user }) => {
  await registerAndLoginUser.viaApi(page, request, user);
});

test('TC-XXX-000: some scenario', async ({ page }) => {
  // page is already logged in — start the real scenario here
});
```

**A minimal new API-only test** (no `page`/browser involved at all):

```js
import { test } from '../../fixtures/fixtures';

test('TC-XXX-000: some API scenario', async ({ authApi, user }) => {
  const response = await authApi.createNewUser(user);

  await authApi.assertSuccessfulCreation(response);
});
```

</details>
