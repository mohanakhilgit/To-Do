import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import type { Todo, NewTodoData } from '../../types/todo';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTodoData) => Promise<void>; // Make onSubmit return a promise
  existingTodo?: Todo | null;
  apiError: string | null; // Accept API error from parent
}

// Helper function to format the date to YYYY-MM-DD
const formatDateForAPI = (date: Date | null): string | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TodoForm: React.FC<TodoFormProps> = ({ isOpen, onClose, onSubmit, existingTodo, apiError }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientError, setClientError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (existingTodo) {
        setTitle(existingTodo.title);
        setDescription(existingTodo.description || '');
        setDueDate(existingTodo.due_date ? new Date(existingTodo.due_date) : null);
      } else {
        setTitle('');
        setDescription('');
        setDueDate(null);
      }
      setClientError(''); // Reset client-side error when form opens
    }
  }, [isOpen, existingTodo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setClientError('Title is required');
      return;
    }
    setClientError('');
    setIsSubmitting(true);
    await onSubmit({
      title,
      description: description.trim() || null,
      due_date: formatDateForAPI(dueDate),
    });
    setIsSubmitting(false);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{existingTodo ? 'Edit Todo' : 'Add New Todo'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display API error at the top of the form */}
          {apiError && <p className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-lg">{apiError}</p>}
          
          <div>
            <label htmlFor="todoTitle" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              id="todoTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What needs to be done?"
            />
            {clientError && <p className="text-red-500 text-sm mt-1">{clientError}</p>}
          </div>
          <div>
            <label htmlFor="todoDesc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="todoDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add some details..."
            ></textarea>
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <DatePicker
              selected={dueDate}
              onChange={(date: Date | null) => setDueDate(date)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select a due date"
              isClearable
              dateFormat="MMMM d, yyyy"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:bg-blue-400">
              {isSubmitting ? 'Saving...' : (existingTodo ? 'Save Changes' : 'Save Todo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoForm;
