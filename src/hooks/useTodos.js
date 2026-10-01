import { useCallback, useEffect, useState } from 'react';
import { loadTodos, saveTodos } from '../utils/todoStorage.js';

function createTodoId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Holds the todo list state, saves it to localStorage on every change
 * and exposes the actions the UI needs.
 */
export function useTodos() {
  const [todos, setTodos] = useState(loadTodos);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = useCallback((text) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setTodos((currentTodos) => [
      ...currentTodos,
      { id: createTodoId(), text: trimmedText, completed: false },
    ]);
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }, []);

  return { todos, addTodo, toggleTodo, deleteTodo };
}