import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App.jsx';

function getInput() {
  return screen.getByPlaceholderText('e.g. Buy groceries');
}

function getAddButton() {
  return screen.getByRole('button', { name: /^add$/i });
}

async function addTodo(user, text) {
  await user.clear(getInput());
  await user.type(getInput(), text);
  await user.click(getAddButton());
}

describe('Todo list', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows the page title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /^todo list$/i })).toBeInTheDocument();
  });

  it('shows an empty state when there are no todos', () => {
    render(<App />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('adds a todo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTodo(user, 'Buy groceries');

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
  });

  it('adds multiple todos and keeps them all visible', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTodo(user, 'First todo');
    await addTodo(user, 'Second todo');
    await addTodo(user, 'Third todo');

    expect(screen.getAllByTestId('todo-item')).toHaveLength(3);
  });

  it('adds a todo when the Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(getInput(), 'Pressed enter{Enter}');

    expect(screen.getByText('Pressed enter')).toBeInTheDocument();
  });

  it('clears the input after adding a todo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTodo(user, 'Clear me');

    expect(getInput()).toHaveValue('');
  });

  it('prevents submitting an empty todo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(getAddButton());

    expect(screen.queryByTestId('todo-item')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/enter a todo/i);
  });

  it('prevents submitting a todo that is only whitespace', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(getInput(), '   {Enter}');

    expect(screen.queryByTestId('todo-item')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/enter a todo/i);
  });

  it('marks a todo as completed and back to incomplete', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTodo(user, 'Toggle me');

    const item = screen.getByTestId('todo-item');
    const checkbox = screen.getByRole('checkbox');

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(item).toHaveClass('todo-item--completed');

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(item).not.toHaveClass('todo-item--completed');
  });

  it('completes todos independently of each other', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTodo(user, 'Pending todo');
    await addTodo(user, 'Done todo');

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('deletes a todo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTodo(user, 'Delete me');
    await addTodo(user, 'Keep me');

    await user.click(screen.getByRole('button', { name: /delete "delete me"/i }));

    expect(screen.queryByText('Delete me')).not.toBeInTheDocument();
    expect(screen.getByText('Keep me')).toBeInTheDocument();
  });

  it('shows the empty state again after deleting the last todo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTodo(user, 'Only todo');
    await user.click(screen.getByRole('button', { name: /delete "only todo"/i }));

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('saves todos to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addTodo(user, 'Persisted todo');

    const saved = JSON.parse(window.localStorage.getItem('ai-to-do.todos'));
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ text: 'Persisted todo', completed: false });
  });

  it('restores todos from localStorage after a remount (page refresh)', async () => {
    const user = userEvent.setup();
    const firstRender = render(<App />);

    await addTodo(user, 'Survives refresh');
    await user.click(screen.getByRole('checkbox'));

    firstRender.unmount();
    render(<App />);

    expect(screen.getByText('Survives refresh')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('ignores corrupted data in localStorage', () => {
    window.localStorage.setItem('ai-to-do.todos', 'not json');

    render(<App />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});