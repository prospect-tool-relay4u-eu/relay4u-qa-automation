# Dev Log

Running log of what changed between commits, in more detail than a commit
message allows. Commits stay short; PR descriptions and this file carry the
full story — what was built, why, and how to use it. Each entry below is
written to be copy-pasted straight into the matching PR description.

---

## 2026-08-13 — TC-SMOKE-001 stabilized: Page Object cleanup, `openAndAssert()`, folder reorg

Reworked Mateusz's original `TC-SMOKE-001` branch end-to-end after
several review cycles didn't land — went in and fixed the code
directly instead of another comment pass.

`ProjectsPage` and `ProjectDetailsPage` moved into `pages/projects/`
(domain folders, matching `pages/auth/`). Every Page Object method now
follows one order: constructor (locators) → floating locators (dynamic
locator builders, e.g. `getProjectCard`) → `openAndAssert()` → actions
→ assertions — no comments needed, the order documents itself.

**New:** `BasePage.openAndAssert()` — throws by default
(`openAndAssert() is not implemented for X`), overridden per page as
`goto()` + `assertLoaded()` (or `waitForPage()` + `assertLoaded()` for
`ProjectDetailsPage`, whose URL is dynamic per project id). One call
lands on a page and confirms it actually loaded, instead of every
caller doing both steps by hand. Implemented on `HomePage`,
`LoginPage`, `SignUpPage`, `ProjectsPage`, `ProjectDetailsPage`.

Removed the redundant `projectsPage.goto()` right after login — the
app already redirects to `/projects` on its own, so `assertLoaded()`
alone is enough there. Replaced the remaining bare `goto()` calls in
test files (`tc-auth-001`, `tc-auth-009`, `tc-smoke-001`'s
`beforeEach`) with `openAndAssert()`.

Added `ProjectsPage.getProjectCard(projectName)` /
`getProjectCardActions(projectName)` — one place building the
project-card locator and its action buttons (`deleteButton`,
`confirmDeleteButton`), instead of every method rebuilding the same
filter. `assertProjectCreated`/`assertProjectDeleted` now check the
specific project by name instead of a generic locator that didn't
actually verify which project it was looking at.

Added `ProjectDetailsPage.assertNewProjectReady(projectName)` — the
check right after creating a project: `#` column header visible (table
has rendered) → breadcrumb (`.breadcrumb-current`) shows the created
project's name → empty-state row (`No records — click "+ Add record"
to get started`) visible. Anchoring on the header first avoids a race
where the name/empty-state text gets checked before the table has
actually rendered. The smoke test no longer calls
`ProjectsPage.assertProjectCreated` at all (that's the method with the
known flake noted below) — `assertNewProjectReady` replaces it as the
post-creation check, run after landing on the details page instead of
racing the projects-list re-render.

Rewrote `tests/e2e/tc-smoke-001-urgent-path.spec.js`: `beforeEach`/
`afterEach` grouped at the top, before the test body. `projectName`
was being generated once at module load time instead of fresh per
test run — moved the `faker` call inside the test body. Dropped a
leftover commented-out `waitForTimeout`.

Also fixed a broken import: moving `ProjectsPage.js` into
`pages/projects/` had silently broken the import in
`tests/auth/tc-auth-001-registration.spec.js`, which still pointed at
the old `pages/ProjectsPage` path.

**Changed:**

- `pages/BasePage.js` — added `openAndAssert()`.
- `pages/HomePage.js`, `pages/auth/LoginPage.js`,
  `pages/auth/SignUpPage.js` — added `openAndAssert()` (`SignUpPage`
  also got its own `goto()`, which didn't exist before).
- `pages/ProjectsPage.js` → `pages/projects/ProjectsPage.js` — moved;
  all locators pulled up into the constructor; added
  `getProjectCard`/`getProjectCardActions`; added `openAndAssert()`.
- `pages/ProjectDetailsPage.js` → `pages/projects/ProjectDetailsPage.js`
  — moved; constructor now passes `actorLabel` through to `BasePage`
  (was silently dropped); added `currentProjectName`,
  `emptyRecordsMessage`, `addRecordButton` locators; added
  `assertNewProjectReady(projectName)` and `openAndAssert()`.
- `tests/e2e/tc-smoke-001-urgent-path.spec.js` — see above.
- `tests/auth/tc-auth-001-registration.spec.js`,
  `tests/auth/tc-auth-009-registration-invalid-password.spec.js` —
  fixed `ProjectsPage` import path (former), replaced `homePage.goto()`
  with `homePage.openAndAssert()` (both).
- See `REFERENCE.md` for how to use any of the above.

---

## 2026-08-10 — TC-SMOKE-001 end-to-end, plus the project/table framework pieces it needed

`tests/e2e/tc-smoke-001.spec.js` covers the full happy-path smoke
scenario: log in → create a project → open it → add a record → fill
and verify its fields → delete the record → delete the project → log
out.

**Known flake:** `assertProjectCreated` occasionally times out even
at 30s, when the create-project API response lags. Not fixed yet —
flagging so a failure here isn't mistaken for a regression.

**New:**

- `tests/e2e/tc-smoke-001.spec.js` — the scenario above.
- `fixtures/authFixtures.js` — new `authFixtures`, logs in
  automatically so individual tests don't need to repeat login steps.
- `pages/ProjectDetailsPage.js` — new. Steps for a page with an
  opened, editable project: `waitForPage`, `waitForProject`,
  `assertLoaded`, `clickAddRecord`, `assertRecordFieldAdded`,
  `clickRecordField`, `fillRecordField`, `assertRecordFieldProperValue`,
  `clickRecordDeleteButton`, `assertRecordDeleted`,
  `assertColumnsOrder`, `clickProjectsNavLink`.
- `pages/ProjectsPage.js` — added `assertCreateProjectFormVisible`,
  `clickFormCreateNewProject`, `fillProjectNameField`,
  `clickCreateProject`, `assertProjectCreated`, `deleteProject`,
  `assertProjectDeleted`, `clickLogOut`.
- `pages/LoginPage.js` — `login` step now waits for the login API
  response before proceeding, to avoid a fake failure when the API is
  slow to respond.
- See `REFERENCE.md` for how to use any of the above.

---

## 2026-07-22 — TC-AUTH-009 bug confirmed fixed, test.fail() removed

The generic "An error occurred" bug tracked by `TC-AUTH-009` is
actually fixed on staging — but not exactly as expected. The frontend
now shows the real reason (`span.form-error`), not the old
`div.alert-error` banner, and the wording changed slightly too
("must contain an uppercase letter, a digit and a special character."
vs. our original assumed text). Re-ran the test after updating both,
confirmed it passes for real (not just "unexpectedly passed" against a
stale locator) — `test.fail()` removed, this is now a permanent
regression test.

**Changed:**

- `pages/auth/SignUpPage.js` — `errorMessage` locator: `.alert-error` →
  `.form-error`.
- `helpers/constants/authMessages.js` — `PASSWORD_REQUIREMENTS` updated
  to match the actual current wording.
- `tests/auth/tc-auth-009-registration-invalid-password.spec.js` —
  `test.fail()` removed; title renamed from "shows generic error" to
  "shows specific validation reason" (now testing the opposite of what
  it originally documented).

---

## 2026-07-22 — TC-AUTH-009 documents a known registration bug

New scenario: registering with a password missing one required
character class (e.g. no special character) shows a generic "An error
occurred. Please try again." instead of the real backend validation
reason ("Password must contain at least one uppercase letter, one
digit and one special character"). The test asserts the _correct_
behavior and uses Playwright's `test.fail()` to mark it as a known,
expected failure — it'll flag itself ("unexpectedly passed") the
moment someone fixes the frontend.

**Run it:** `npx playwright test tests/auth/tc-auth-009-registration-invalid-password.spec.js`
— no real email gets sent (registration is rejected before the backend
would send one), so this doesn't touch the testmail.app quota.

**New:**

- `tests/auth/tc-auth-009-registration-invalid-password.spec.js` — the
  scenario above.
- `pages/auth/SignUpPage.js` — added `errorMessage` locator
  (`.alert-error`) and `assertErrorMessage(message)`.
- `helpers/constants/authMessages.js` — added `GENERIC_ERROR`, the
  current (buggy) text shown on any sign-up error.
- See `REFERENCE.md` for how to use any of the above.

---

## 2026-07-21 18:12 — TC-AUTH-001 runs end-to-end, plus the framework pieces it needed

`tests/auth/tc-auth-001-registration.spec.js` now covers the full
scenario: register → real email arrives → enter the code → land on
`/login?verified=true` → log in → land on `/projects` with the right
user's name shown. Previously it stopped at the "check your email" screen.

**Run it:** `npx playwright test tests/auth/tc-auth-001-registration.spec.js`
— every run sends one real email via testmail.app (100/month, shared team
quota). Don't loop it while debugging something unrelated.

**New:**

- `helpers/email/getVerificationCode.js` — `createTestEmail()` +
  `getVerificationCode(tag)`, fetches the real 6-digit code from
  testmail.app. New env vars: `TESTMAIL_API_KEY`, `TESTMAIL_API_URL`,
  `TESTMAIL_NAMESPACE` (in `.env`/`.env.example`).
- `helpers/testStep.js` + `pages/BasePage.js` — every Page Object now
  extends `BasePage` and gets `this.step()` for free (wraps Playwright's
  `test.step()`). Optional `actorLabel` prefixes steps per-user, for
  future multi-user IDOR tests.
- `pages/auth/SignUpPage.js`, `LoginPage.js`, `VerifyEmailPage.js` — moved
  under `pages/auth/`, separate from general pages.
- `pages/ProjectsPage.js` — new. Checks the `/projects` heading
  (`exact: true` — otherwise also matches the "No projects yet" empty
  state) and the logged-in user's name.
- `helpers/constants/authMessages.js` — exact UI/API strings
  (`AUTH_MESSAGES`), one source of truth instead of hardcoded strings in
  every Page Object. Split by domain — Mateusz adds his own file for
  fields/projects/records instead of us sharing one file.
- `helpers/testData/generateNewUser.js` — password suffix `A1!` → `Aa1!`,
  fixes an intermittent backend validation failure (missing complexity
  class).
- See `REFERENCE.md` for how to use any of the above.
