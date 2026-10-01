import AddTodoForm from './components/AddTodoForm.jsx';
import TodoList from './components/TodoList.jsx';
import { useTodos } from './hooks/useTodos.js';

export default function App() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const remainingCount = todos.filter((todo) => !todo.completed).length;

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Todo List</h1>
        <p className="app__subtitle">
          {todos.length === 0
            ? 'Keep track of what you need to do.'
            : `${remainingCount} of ${todos.length} remaining`}
        </p>
      </header>

      <main className="app__main">
        <AddTodoForm onAdd={addTodo} />
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      </main>

      <footer className="app__footer">
        <p>Todos are saved in this browser.</p>
      </footer>
    </div>
  );
}