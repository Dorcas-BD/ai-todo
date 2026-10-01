const STORAGE_KEY = 'ai-to-do.todos';

function isValidTodo(todo) {
  return (
    typeof todo === 'object' &&
    todo !== null &&
    typeof todo.id === 'string' &&
    typeof todo.text === 'string' &&
    typeof todo.completed === 'boolean'
  );
}

/**
 * Reads todos from localStorage. Returns an empty list when storage is
 * unavailable or the stored value is not valid JSON.
 */
export function loadTodos() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidTodo);
  } catch {
    return [];
  }
}

/** Persists todos to localStorage. Silently ignores storage errors. */
export function saveTodos(todos) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Storage may be unavailable (private mode, quota exceeded). The app
    // still works for the current session, it just will not persist.
  }
}