import React from 'react';
import type { Todo } from '../../types/todo';
import { useAuth } from '../auth/useAuth';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, isCompleted: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  const { user } = useAuth();
  const isOwner = user?.id === todo.created_by;

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className={`todo-item bg-white mb-3 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300 ${todo.is_completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button className="complete-btn mt-1 flex-shrink-0" onClick={() => onToggle(todo.id, !todo.is_completed)}>
          <i className={`fas ${todo.is_completed ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-300'} text-2xl transition-colors`}></i>
        </button>
        <div className="flex-1">
          <h3 className={`font-medium text-lg ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{todo.title}</h3>
          {todo.description && <p className="text-gray-600 mt-1 text-sm">{todo.description}</p>}
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
            <span>By: {todo.created_by_username}</span>
            {todo.due_date && <span>Due: {formatDate(todo.due_date)}</span>}
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={() => onEdit(todo)} className="text-gray-400 hover:text-blue-500 transition-colors">
              <i className="fas fa-pencil-alt"></i>
            </button>
            <button onClick={() => onDelete(todo.id)} className="text-gray-400 hover:text-red-500 transition-colors">
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
