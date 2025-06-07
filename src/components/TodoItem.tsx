import React from 'react';

interface TodoItemProps {
  id: string;
  text: string;
  done: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ id, text, done, onToggle, onDelete }) => {
  return (
    <div className="todo-item">
      <input
        type="checkbox"
        checked={done}
        onChange={() => onToggle(id)}
      />
      <span style={{ textDecoration: done ? 'line-through' : 'none' }}>
        {text}
      </span>
      <button onClick={() => onDelete(id)}>×</button>
    </div>
  );
};

export default TodoItem; 