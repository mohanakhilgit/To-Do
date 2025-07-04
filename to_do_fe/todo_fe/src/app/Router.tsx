import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import TodoListPage from '../pages/TodoListPage';
import ProtectedRoute from '../components/ProtectedRoute';
import RegisterPage from '../pages/RegisterPage'; // Import the new page

const AppRouter: React.FC = () => {
  const router = createBrowserRouter([
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/register',
      element: <RegisterPage />, // Use the real RegisterPage here
    },
    {
      path: '/',
      element: <ProtectedRoute />,
      children: [
        {
          index: true,
          element: <TodoListPage />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRouter;
