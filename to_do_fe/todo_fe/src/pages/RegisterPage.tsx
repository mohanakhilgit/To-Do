import React, { useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(formData);
      navigate('/'); // Redirect to home on successful registration
    } catch (err) {
      console.error('Registration failed on page:', err);
      // Error is already set in the context, so we just need to stop submitting
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Create a new account
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input name="username" type="text" placeholder="Username" required onChange={handleChange} className="input-style" />
            <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="input-style" />
            <input name="first_name" type="text" placeholder="First Name (Optional)" onChange={handleChange} className="input-style" />
            <input name="last_name" type="text" placeholder="Last Name (Optional)" onChange={handleChange} className="input-style" />
            <input name="password" type="password" placeholder="Password" required onChange={handleChange} className="input-style" />
            <input name="password2" type="password" placeholder="Confirm Password" required onChange={handleChange} className="input-style" />
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'Registering...' : 'Sign up'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
      {/* A simple style definition for inputs to avoid repetition */}
      <style>{`.input-style { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; }`}</style>
    </div>
  );
};

export default RegisterPage;
