import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import { fadeIn } from '../styles/animations';
import { colors } from '../styles/theme';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const response = await axios.post('{{URL}}/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (error) {
      console.error('Login error:', error);
      setApiError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to your account">
      <motion.form onSubmit={handleSubmit} variants={fadeIn}>
        {apiError && (
          <motion.div 
            className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {apiError}
          </motion.div>
        )}
        
        <InputField
          type="email"
          name="email"
          placeholder="Email address"
          icon={faEnvelope}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        
        <InputField
          type="password"
          name="password"
          placeholder="Password"
          icon={faLock}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <Link 
              to="/forgot-password" 
              className="font-medium text-blue-600 hover:text-blue-500"
              style={{ color: colors.primary }}
            >
              Forgot password?
            </Link>
          </div>
        </div>
        
        <SubmitButton 
          text="Sign In" 
          loading={loading} 
          disabled={loading}
        />
        
        <motion.div 
          className="mt-6 text-center"
          variants={fadeIn}
        >
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
              style={{ color: colors.primary }}
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
};

export default Login;