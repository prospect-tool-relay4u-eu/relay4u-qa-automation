# Dev Log

Running log of what changed between commits, in more detail than a commit
message allows. Commits stay short; PR descriptions and this file carry the
full story — what was built, why, and how to use it. Each entry below is
written to be copy-pasted straight into the matching PR description.

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
