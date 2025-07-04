import React, { useState, useEffect, useMemo } from 'react';
import type { Todo, NewTodoData } from '../../types/todo';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../../services/todoService';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { useDebounce } from '../../hooks/useDebounce';

const ITEMS_PER_PAGE = 5;

// Helper to parse complex DRF error messages
const parseApiError = (error: any): string => {
  if (error.response?.data?.message) {
    const errorData = error.response.data.message;
    if (typeof errorData === 'object' && errorData !== null) {
      const firstKey = Object.keys(errorData)[0];
      const firstMessage = errorData[firstKey][0];
      // Capitalize the field name and format the message
      return `${firstKey.charAt(0).toUpperCase() + firstKey.slice(1)}: ${firstMessage}`;
    } else if (typeof errorData === 'string') {
      return errorData;
    }
  }
  return 'An unexpected error occurred.';
};

const TodoList: React.FC = () => {
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsLoading(true);
        const fetchedTodos = await fetchTodos();
        setAllTodos(fetchedTodos);
      } catch (err) {
        setListError('Failed to fetch todos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadTodos();
  }, []);

  const filteredTodos = useMemo(() => {
    if (!debouncedSearchTerm) return allTodos;
    return allTodos.filter(todo =>
      (todo.title || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (todo.description || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [allTodos, debouncedSearchTerm]);

  const paginatedTodos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTodos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTodos, currentPage]);

  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);

  const handleFormSubmit = async (data: NewTodoData) => {
    setFormError(null); // Clear previous form error on new submission
    try {
      if (editingTodo) {
        const updated = await updateTodo(editingTodo.id, data);
        setAllTodos(allTodos.map((t) => (t.id === editingTodo.id ? { ...t, ...updated } : t)));
      } else {
        const newTodo = await createTodo(data);
        setAllTodos([newTodo, ...allTodos]);
      }
      closeForm();
    } catch (err) {
      const parsedError = parseApiError(err);
      setFormError(parsedError);
      throw err;
    }
  };

  const handleToggleTodo = async (id: number, is_completed: boolean) => {
    try {
      const updated = await updateTodo(id, { is_completed });
      setAllTodos(allTodos.map((todo) => todo.id === id ? { ...todo, ...updated } : todo));
    } catch (err) {
      setListError('Failed to update status. Please try again.');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    const originalTodos = [...allTodos];
    setAllTodos(allTodos.filter((t) => t.id !== id));
    try {
      await deleteTodo(id);
    } catch (err) {
      setListError('Failed to delete todo. Reverting changes.');
      setAllTodos(originalTodos);
    }
  };

  const openFormToEdit = (todo: Todo) => {
    setFormError(null);
    setEditingTodo(todo);
    setIsFormOpen(true);
  };
  
  const openFormToCreate = () => {
    setFormError(null);
    setEditingTodo(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
    setFormError(null); 
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <TodoForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        existingTodo={editingTodo}
        apiError={formError}
      />
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          <button onClick={openFormToCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
            <i className="fas fa-plus"></i>
            <span>Add Todo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">My Todos</h2>
        </div>
        <div className="todos-container min-h-[300px] p-4">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : listError ? (
            <div className="text-center py-12 text-red-500">{listError}</div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty-state text-center py-12">
              <i className="fas fa-clipboard-list text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-medium text-gray-500 mb-2">No todos found</h3>
              <p className="text-gray-400">Try a different search or create a new todo!</p>
            </div>
          ) : (
            paginatedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onEdit={openFormToEdit}
              />
            ))
          )}
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center items-center gap-2 text-sm text-gray-600">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </>
  );
};

export default TodoList;
