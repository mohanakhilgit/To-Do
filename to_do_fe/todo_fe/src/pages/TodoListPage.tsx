import React from 'react';
import { useAuth } from '../features/auth/useAuth';
import TodoList from '../features/todos/TodoList';

const TodoListPage: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen font-sans">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        Todo App
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 hidden sm:inline">Welcome, {user?.username}!</span>
                        <button 
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Logout
                        </button>
                    </div>
                </header>
                <main>
                    <TodoList />
                </main>
            </div>
            {/* Add Font Awesome for icons */}
            <style>{`
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .todo-item {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default TodoListPage;
