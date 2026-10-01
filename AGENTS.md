# AGENTS.md

Instructions for AI coding agents (and humans) working on this repository.
Read this file completely **before** making any change.

---

# Project Overview

This is a **Todo List web application** — a small, single-page frontend where a
user can add, complete, un-complete, and delete todos.

The whole purpose of the app is to be *small and dependable*:

- It runs entirely in the browser. There is no backend, no database, and no API.
- Todos are stored in the browser's `localStorage` under the key
  **`ai-to-do.todos`**, so they survive a page refresh or closing and reopening
  the browser.
- It is a static site: `npm run build` produces plain HTML/CSS/JS that can be
  deployed to any static host.

The application is intentionally minimal. It was built as a Stage 1 deliverable
to demonstrate a complete, working, deployed app. **Scope creep is the primary
risk in this repository** — see [UI/UX Guidelines](#uiux-guidelines).

Current scale of the codebase (keep it near this size):

| Area               | Size                      |
| ------------------ | ------------------------- |
| Application source | ~250 lines across 9 files |
| Stylesheet         | ~220 lines, one file      |
| Tests              | ~132 lines, 15 test cases |

---

# Technology Stack

Documented from the **actually installed** versions in `package.json`
(`npm ls --depth=0`), not from assumptions.

## Runtime dependencies (only two — keep it this way)

| Package     | Installed | Role         |
| ----------- | --------- | ------------ |
| `react`     | 19.3.0    | UI library   |
| `react-dom` | 19.3.0    | DOM renderer |

## Dev dependencies (build + test only — nothing here ships to the browser)

| Package                       | Installed | Role                                  |
| ----------------------------- | --------- | ------------------------------------- |
| `vite`                        | 8.3.2     | Dev server and production bundler     |
| `@vitejs/plugin-react`        | 6.1.1     | Fast Refresh + JSX transform          |
| `vitest`                      | 5.0.3     | Test runner                           |
| `jsdom`                       | 29.1.1    | DOM environment for tests              |
| `@testing-library/react`      | 16.3.3    | Render and query components in tests  |
| `@testing-library/user-event` | 14.6.7    | Simulates real user interaction       |
| `@testing-library/jest-dom`   | 7.0.1     | Extra DOM matchers (`toBeInTheDocument`) |

## Deliberately NOT used

- **No TypeScript** — this is plain JavaScript with JSX (`.jsx` / `.js`).
- **No UI library, CSS framework, or component kit** (no Tailwind, Bootstrap,
  MUI, shadcn).
- **No state management library** (no Redux/Zustand) — one `useState` is enough.
- **No router, no backend, no environment variables.**
- **No linter or formatter config** (no ESLint/Prettier files exist). Match the
  existing style by hand, as described in [Coding Conventions](#coding-conventions).

## Tooling facts that matter when editing

- `package.json` has `"type": "module"` — all config and scripts are ESM.
- `StrictMode` **is enabled** in `src/main.jsx`. Side effects run twice in dev.
- The Vitest config lives inside `vite.config.js` under the `test` key:
  `environment: 'jsdom'`, `globals: true`,
  `setupFiles: './src/setupTests.js'`, `css: true`.
- `README.md` says "Vite 7" in its tech-stack list. That is **stale**; the
  installed version is 8.3.2. Trust `package.json`.

---

# Project Structure

```
ai-to-do/
├── AGENTS.md                 # this file
├── index.html                # HTML shell, page title, meta viewport
├── package.json              # scripts + dependency manifest
├── package-lock.json         # exact dependency versions (do not hand-edit)
├── vite.config.js            # Vite plugins + Vitest test configuration
├── README.md                 # human-facing readme
├── .gitignore
├── dist/                     # build output (generated, git-ignored)
├── node_modules/             # installed packages (generated, git-ignored)
└── src/
    ├── main.jsx              # entry point — mounts <App /> into #root
    ├── App.jsx               # page composition: header, form, list, footer
    ├── index.css             # THE ONLY stylesheet (tokens + all component CSS)
    ├── setupTests.js         # test setup: matchers, cleanup, storage reset
    ├── components/
    │   ├── AddTodoForm.jsx   # input + Add button, Enter key, empty validation
    │   ├── TodoList.jsx      # renders TodoItem list, or EmptyState when empty
    │   ├── TodoItem.jsx      # one row: checkbox toggle + Delete button
    │   └── EmptyState.jsx    # "No todos yet" placeholder
    ├── hooks/
    │   └── useTodos.js       # owns todo state; addTodo/toggleTodo/deleteTodo
    ├── utils/
    │   └── todoStorage.js    # loadTodos()/saveTodos() wrapping localStorage
    └── __tests__/
        └── App.test.jsx      # 15 behaviour tests rendering the real <App />
```

## Responsibility of each source file

| File                         | Responsibility                                      | Notes |
| ---------------------------- | --------------------------------------------------- | ----- |
| `src/main.jsx`               | Mounts React into `#root`, imports the stylesheet   | Only place `createRoot` appears |
| `src/App.jsx`                | Page layout; wires `useTodos` to the components     | Owns no todo logic; only the "X of Y remaining" subtitle |
| `src/index.css`              | **All** styling: tokens, layout, components, responsive rules | Single stylesheet by design |
| `src/components/AddTodoForm.jsx` | Input state, validation, submit              | Receives `onAdd`; never touches storage |
| `src/components/TodoList.jsx` | Maps todos to `TodoItem`; empty branch               | Receives `todos`, `onToggle`, `onDelete` |
| `src/components/TodoItem.jsx` | Renders one todo row                                 | Presentational; changes bubble up via callbacks |
| `src/components/EmptyState.jsx` | Placeholder when the list is empty                  | Static copy only |
| `src/hooks/useTodos.js`      | Single source of truth for todo data                 | Persists on every change via `useEffect` |
| `src/utils/todoStorage.js`   | The only code that touches `localStorage`            | Never import storage anywhere else |
| `src/setupTests.js`          | Registers jest-dom, clears DOM + storage per test    | Runs via `setupFiles` |

## Data flow (keep this intact)

```
user types, then clicks Add or presses Enter
        ↓
AddTodoForm.handleSubmit  → trims text, rejects empty input
        ↓
App passes onAdd = addTodo
        ↓
useTodos.addTodo          → appends { id, text, completed: false }
        ↓
setTodos re-renders AND useEffect fires → saveTodos() → localStorage
```

Components never import storage or hook internals directly — `App.jsx` passes
callbacks down.

## The todo object shape

```js
{ id: string, text: string, completed: boolean }
```

If you add a field, update `isValidTodo()` in `src/utils/todoStorage.js`, or
previously saved todos will be silently filtered out on load.

---

# Running the Project

Requires Node.js 18+ (developed and verified on Node 24) and npm.

```bash
# Run from the project root:
# c:\Users\bamis\OneDrive\Documents\HNG\HNG 15\ai-to-do

npm install         # install dependencies (creates node_modules)
npm run dev         # dev server with Fast Refresh → http://localhost:5173
npm test            # run the full Vitest suite once (exit 0 = pass)
npm run build       # production build → dist/
npm run preview     # serve the built dist/ to verify real output
```

Useful variations:

```bash
npx vitest                      # watch mode while developing
npx vitest run -t "deletes"    # run only tests whose name matches "deletes"
npm run dev -- --port 3000      # start the dev server on a different port
```

Notes:

- There is **no lint script**. Do not invent one; verify changes with
  `npm test` and `npm run build`.
- `npm run build` prints a `PLUGIN_TIMINGS` performance notice from the bundler
  on stderr. **This is informational, not an error** — the build succeeds if the
  exit code is 0 and `dist/` exists.

---

# Coding Conventions

## General style (match the existing files exactly)

- 2-space indentation, single quotes, semicolons.
- Trailing commas in multi-line objects, arrays, and JSX prop lists.
- One blank line between logical blocks; no blank line directly after `{`.
- Keep functions short; extract a named helper if one grows past ~20 lines.

## Naming

| Thing                 | Convention                                  | Example                              |
| --------------------- | ------------------------------------------- | ------------------------------------ |
| React components      | PascalCase, one per file                    | `TodoItem`, `AddTodoForm`            |
| Non-component files   | camelCase                                   | `useTodos.js`, `todoStorage.js`      |
| Hooks                 | `use` prefix                                | `useTodos`                           |
| Functions/variables   | camelCase                                   | `addTodo`, `remainingCount`          |
| Handler functions     | `handle` + event name                       | `handleSubmit`, `handleChange`       |
| Event handler props   | `on` + prop name                            | `onAdd`, `onToggle`, `onDelete`      |
| Constants             | UPPER_SNAKE_CASE                            | `STORAGE_KEY`                        |
| CSS classes           | BEM: `block__element` / `block--modifier`   | `todo-item__checkbox`, `todo-item--completed` |

## JavaScript conventions

- **Components use `export default`.** The `useTodos` hook uses a **named
  export** — keep each file consistent with how it already exports.
- Inside components use **function declarations** for handlers
  (`function handleSubmit() {}`), matching existing code. Arrow functions are
  fine for short inline callbacks such as `.map()` and `onClick`.
- Use `const` by default; `let` only when a binding is genuinely reassigned.
- Prefer array methods (`.map`, `.filter`, `.find`) over manual loops.
- Prefer optional chaining / nullish coalescing over defensive `if` ladders
  when it improves readability.
- No semicolon-less style, no `var`.
- Use JSDoc block comments (`/** ... */`) only where intent is genuinely
  non-obvious — e.g. why native form submission is relied upon, or why storage
  errors are swallowed. Do not comment self-evident code.

## Component organization

- Components are **presentational**. They receive data and callbacks as props
  and never read or write `localStorage` themselves.
- Keep the one-component-per-file layout. Do not merge `TodoItem.jsx` into
  `TodoList.jsx`.
- Keep components small; extract rather than nesting deeply.
- Prefer a simple ternary or early return over complex boolean logic in JSX.

## File organization

- New UI pieces go in `src/components/`, new stateful logic in `src/hooks/`,
  new non-React helpers in `src/utils/`.
- **Styling goes in `src/index.css`.** Do not create new `.css` files and do not
  import CSS inside components — this project deliberately uses one stylesheet.
- Tests live in `src/__tests__/`, named after the feature they cover.
- Do not add barrel files (`index.js` re-exports) — there are none today and
  direct imports are clearer.

## Avoiding unnecessary abstractions

- **Do not** introduce a store, context, reducer, or generic "list" abstraction
  to solve a problem `useState` already solves.
- Do not extract a component used exactly once for a few lines of JSX.
- Do not add prop-types, a config system, or a theming layer.
- Do not wrap the two storage functions in a service class or a generic
  `useLocalStorage` hook unless the need is real and stated.
- If you add an indirection layer, delete it and write the direct version.

---

# UI/UX Guidelines

The UI is deliberately **clean, modern, minimal, and professional**. It must
stay that way.

## Responsive — mandatory

- The layout must work on desktop, tablet, and mobile widths.
- Existing responsive behaviour lives in the `@media (max-width: 480px)` block
  at the end of `src/index.css`: the form stacks vertically, the Add button
  becomes full-width, padding and title size shrink.
- Never introduce a fixed pixel width that would overflow a 360px-wide screen.
- Avoid horizontal scrolling at any width. Long todo text wraps via
  `overflow-wrap: anywhere`.
- Build new layouts with `flex`/`grid` plus `min-width: 0` on flexible
  children rather than fixed widths.

## Spacing and typography — mandatory

- **Never hardcode new spacing values.** Use the scale in `:root`:
  `--space-1` (0.25rem), `--space-2` (0.5rem), `--space-3` (0.75rem),
  `--space-4` (1rem), `--space-6` (1.5rem).
- Use the existing colour tokens (`--color-accent`, `--color-danger`,
  `--color-text-muted`, `--color-border`, `--color-surface`, `--color-page`,
  `--color-completed`, …). Add a token rather than inlining a hex value.
- Use the existing radii (`--radius-sm`, `--radius-md`) and `--shadow-card`.
- The font stack is `system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica,
  Arial, sans-serif` on `body`. Do not add web fonts or icon libraries.
- Body text is `16px` base with `line-height: 1.5`. Keep that.

## Accessibility — mandatory, do not regress

- The page has exactly one `<h1>` ("Todo List"). Keep heading order sane.
- The input has a real `<label htmlFor="new-todo-text">`.
- Completion uses a **native `<input type="checkbox">`** wrapped in a label, so
  the row is clickable and keyboard/screen-reader friendly.
- The Delete button carries an `aria-label` including the todo text
  (`Delete "Buy groceries"`) — keep this pattern.
- Validation errors use `role="alert"`, with `aria-invalid` and
  `aria-describedby` wired to the message.
- Never remove `htmlFor`/`id` pairs, `aria-*` attributes, or `<form>` semantics.
- Every interactive element must be keyboard reachable with a visible focus
  style (the input already has a 2px accent outline).
- Never use colour alone to convey meaning — completed todos have both a
  line-through and a muted colour.

## Simplicity — mandatory

- **Do not add features that were not requested.** No filters, search, due
  dates, tags, categories, priority levels, drag-and-drop reordering, bulk
  actions, "clear completed", undo, themes/dark mode, animations, sound, or
  accounts/sync.
- Each user action (add, complete, un-complete, delete) stays one obvious
  control.
- If a feature *is* requested, implement the smallest version that satisfies it
  and add a test for it.

---

# Todo Application Rules

These behaviours are the contract of the application. **They must keep working
after every change.** Each has at least one test in `src/__tests__/App.test.jsx`.

1. **Adding a todo** — Typing text and pressing **Add** creates one new todo
   appended to the end of the list. The input clears afterwards and any error
   message is cleared.
2. **Enter key** — Pressing **Enter** in the input adds the todo. This works
   because the input sits inside a `<form>` with an `onSubmit` handler and the
   Add button is `type="submit"`. **Do not replace this with a manual
   `onKeyDown` handler** — that would be a regression in simplicity.
3. **Preventing empty todos** — Submitting with an empty input *or* one
   containing only whitespace must not create a todo, and must show the inline
   error *"Please enter a todo before adding it."* Validation uses
   `text.trim()`; `addTodo` in the hook refuses empty text as a second guard.
4. **Completing and un-completing** — Clicking a row's checkbox flips
   `completed` for **only that** todo, in both directions, with no effect on
   other todos. The `todo-item--completed` class drives the visual difference
   (line-through + muted colour + lighter background).
5. **Deleting** — The Delete button removes only its own todo, matched by `id`.
   Deleting the last remaining todo brings back the empty state.
6. **Persistence across refresh** — Every add, toggle, and delete must be
   written to `localStorage` under the key **`ai-to-do.todos`** as a JSON array
   of `{ id, text, completed }`. On load the app reads that key and restores the
   list. Corrupt or non-array JSON must fall back to an empty list, not crash.
7. **Empty state** — With zero todos, `EmptyState` renders "No todos yet" plus
   the guidance line.

Storage rules:

- Only `src/utils/todoStorage.js` may touch `localStorage`.
- The key string `'ai-to-do.todos'` is referenced there **and** in tests.
  Changing it invalidates users' existing todos.
- Storage calls stay inside `try/catch` so private-browsing or quota failures
  degrade gracefully instead of breaking the app.

---

# Testing Requirements

A change is **not complete** until verified. Follow this order.

## 1. Run the checks

```bash
npm test        # all 15 tests must pass
npm run build   # must succeed and produce dist/
```

Both must exit with code 0. If either fails, **fix the failure before
finishing** — never leave a broken build or failing test behind, and never
weaken or delete a test just to make it pass.

## 2. Test the affected functionality

- Add a test to `src/__tests__/App.test.jsx` for any new or changed behaviour,
  inside the existing `describe('Todo list')` block, reusing the `addTodo`,
  `getInput`, and `getAddButton` helpers.
- Tests render the real `<App />`, so they exercise the hook, components, and
  persistence together. Prefer this over testing units in isolation.
- Use `userEvent` for interaction (not `fireEvent`), and
  `await user.type(input, 'text{Enter}')` to exercise the Enter key.
- `setupTests.js` already clears `localStorage` and unmounts between tests.

### Testing gotchas that have already caused failures here

- **Accessible-name matching is case-sensitive when given a plain string.**
  `getByRole('button', { name: 'add' })` fails against a button labelled "Add".
  Use a case-insensitive regex: `{ name: /^add$/i }`.
- Two hooks are in play, not one: **`beforeEach`** clears storage *before* each
  test, **`afterEach`** runs cleanup *after*. A test that seeds storage (like the
  corrupted-data test) should set it up in its own body, not in `beforeEach`.
- Use the existing `data-testid="todo-item"` and `data-testid="empty-state"`.
  Do not add new test IDs for elements you can query by role or label.

## 3. Confirm nothing regressed

- Re-run the **entire** suite, not just the test you added — the behaviours in
  [Todo Application Rules](#todo-application-rules) are the regression net for
  the whole app.
- For UI changes, run `npm run dev` and check the page renders; run
  `npm run preview` after `npm run build` to verify the real production output.
- For layout changes, check a narrow mobile width (~375px) as well as desktop.

## 4. Clean up

- Stop any dev/preview server you started, and delete temporary files
  (screenshots, logs, scratch scripts) you created.

---

# Rules for Modifying the Project

When working on this project, an AI coding agent must:

1. **Read AGENTS.md before making changes.** It describes the real stack,
   structure, and constraints of this codebase.
2. **Inspect existing code before modifying it.** Match what is already there
   rather than replacing it with a pattern you prefer.
3. **Follow the existing architecture unless there is a strong reason to change
   it** — components + one `useTodos` hook + one stylesheet + one storage
   module. If you do change it, say why explicitly.
4. **Avoid unnecessary dependencies.** Two runtime dependencies is the budget.
   Adding a package requires a concrete need that plain React + CSS cannot meet.
5. **Avoid changing unrelated files.** Keep diffs focused on the task at hand.
6. **Do not remove existing functionality without explicit instruction** — no
   deleting features, tests, or accessibility attributes to simplify a task.
7. **Keep changes focused and maintainable.** Match existing style; leave the
   codebase no larger or more abstract than it needs to be.
8. **Test changes before considering the task complete.** `npm test` and
   `npm run build` both pass, plus a manual check of affected behaviour.

Additional hard rules:

- **Never** commit `node_modules/` or `dist/` (both are git-ignored).
- **Never** hand-edit `package-lock.json`; regenerate it via npm.
- **Never** introduce secrets, API keys, analytics, or network calls — the app
  is fully offline and must stay that way.
- **Never** change the storage key `'ai-to-do.todos'` or the todo object shape
  without also updating `isValidTodo()` and the tests.

---

# Deployment

The app is a **purely static frontend**. There is no server, no database, and no
environment variable to configure.

## Build

```bash
npm run build
```

This emits into `dist/`:

```
dist/
├── index.html
└── assets/
    ├── index-<hash>.css   # ~3.7 kB
    └── index-<hash>.js    # ~223 kB (~70 kB gzipped, mostly React)
```

The output is self-contained and uses relative asset paths. Verify a production
build locally before deploying:

```bash
npm run preview     # serves dist/ at http://localhost:4173
```

## Hosting

Deploy the **`dist/`** folder (or the repository, letting the host run
`npm run build`) to any static host:

- **Vercel** — Framework preset: Vite; build `npm run build`; output `dist`.
- **Netlify** — Build `npm run build`; publish directory `dist`.
- **GitHub Pages** — build to `dist/` and publish that folder from a branch.
- **Cloudflare Pages** — build `npm run build`; output `dist`.

No rewrites, SPA fallback rules, or environment variables are required, because
the app has no client-side routing.

## Important deployment notes

- **Data is per-browser.** Todos live in the visitor's own `localStorage`, so
  users do not share a list and there is no cross-device sync.
- Deploying under a sub-path (e.g. GitHub Pages `/repo-name/`) works without
  extra configuration, since Vite emits relative asset paths.
- The app makes no external requests at runtime, so it works offline after the
  initial page load.
- A feature needing a backend or shared database would be a **significant**
  change to this project's scope and must be agreed first.