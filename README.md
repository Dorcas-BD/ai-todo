# Todo List

A clean, simple and responsive todo list built with React and Vite. Todos are
saved in the browser's local storage, so they survive a refresh or closing the
tab.

## Features

- Add a todo with the **Add** button or the **Enter** key
- Empty (or whitespace-only) todos are rejected with an inline message
- Mark todos as completed and back to incomplete with the checkbox
- Delete a todo
- Completed todos are shown with a line-through and muted colour
- An empty state is shown when there are no todos
- Todos persist across refreshes via `localStorage`

## Tech stack

- [React](https://react.dev) 19
- [Vite](https://vite.dev) 7
- Plain CSS (no UI library)
- Vitest + Testing Library (dev only) for the behaviour tests

## Getting started

```bash
npm install     # install dependencies
npm run dev     # start the dev server at http://localhost:5173
npm test        # run the test suite
npm run build   # build for production into dist/
npm run preview # preview the production build
```

## Deployment

`npm run build` produces a static site in `dist/`. Deploy that folder to any
static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages). No server or
environment variables are required.

## Project structure

```
src/
├── App.jsx                 # page composition
├── main.jsx                # React entry point
├── index.css               # global styles and design tokens
├── components/
│   ├── AddTodoForm.jsx     # input + Add button, Enter key, empty validation
│   ├── TodoList.jsx        # renders items or the empty state
│   ├── TodoItem.jsx        # checkbox toggle + delete button
│   └── EmptyState.jsx      # "no todos yet" message
├── hooks/useTodos.js       # todo state + add/toggle/delete actions
├── utils/todoStorage.js    # localStorage read/write
└── __tests__/App.test.jsx  # behaviour tests
```