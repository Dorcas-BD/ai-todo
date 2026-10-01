import { useState } from 'react';

/**
 * Input + Add button. Using a real <form> means the Enter key submits
 * natively, so no extra key handling code is needed.
 */
export default function AddTodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!text.trim()) {
      setError('Please enter a todo before adding it.');
      return;
    }

    onAdd(text);
    setText('');
    setError('');
  }

  function handleChange(event) {
    setText(event.target.value);
    if (error) setError('');
  }

  return (
    <form className="add-todo" onSubmit={handleSubmit} noValidate>
      <label className="add-todo__label" htmlFor="new-todo-text">
        What needs to be done?
      </label>

      <div className="add-todo__row">
        <input
          id="new-todo-text"
          className="add-todo__input"
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="e.g. Buy groceries"
          autoComplete="off"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'add-todo-error' : undefined}
        />
        <button className="add-todo__button" type="submit">
          Add
        </button>
      </div>

      {error && (
        <p className="add-todo__error" id="add-todo-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}