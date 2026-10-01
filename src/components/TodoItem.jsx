export default function TodoItem({ todo, onToggle, onDelete }) {
  const className = todo.completed ? 'todo-item todo-item--completed' : 'todo-item';

  return (
    <li className={className} data-testid="todo-item">
      <label className="todo-item__main">
        <input
          className="todo-item__checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className="todo-item__text">{todo.text}</span>
      </label>

      <button
        className="todo-item__delete"
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.text}"`}
      >
        Delete
      </button>
    </li>
  );
}