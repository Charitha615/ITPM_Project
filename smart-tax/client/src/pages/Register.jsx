import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faHome, 
  faPhone, 
  faIdCard 
} from '@fortawesome/free-solid-svg-icons';

import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import { fadeIn } from '../styles/animations';
import { colors } from '../styles/theme';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    contact_number: '',
    gender: 'male',
    nationality: '',
    id_number: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
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
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.contact_number) newErrors.contact_number = 'Contact number is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.id_number) newErrors.id_number = 'ID number is required';
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
      await axios.post('{{URL}}/api/auth/register', formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Registration Successful" subtitle="You will be redirected to login page">
        <motion.div 
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Account created successfully!</h3>
          <p className="text-gray-600">You can now login with your credentials.</p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create an account" subtitle="Get started with our platform">
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
          type="text"
          name="name"
          placeholder="Full name"
          icon={faUser}
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
        
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
          placeholder="Password (min 6 characters)"
          icon={faLock}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        
        <InputField
          type="text"
          name="address"
          placeholder="Full address"
          icon={faHome}
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
        />
        
        <InputField
          type="tel"
          name="contact_number"
          placeholder="Contact number"
          icon={faPhone}
          value={formData.contact_number}
          onChange={handleChange}
          error={errors.contact_number}
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Female</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="other"
                checked={formData.gender === 'other'}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Other</span>
            </label>
          </div>
        </div>
        
        <InputField
          type="text"
          name="nationality"
          placeholder="Nationality"
          value={formData.nationality}
          onChange={handleChange}
          error={errors.nationality}
        />
        
        <InputField
          type="text"
          name="id_number"
          placeholder="ID Number"
          icon={faIdCard}
          value={formData.id_number}
          onChange={handleChange}
          error={errors.id_number}
        />
        
        <div className="mb-6">
          <label className="flex items-start">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              required
            />
            <span className="ml-2 block text-sm text-gray-700">
              I agree to the <a href="#" className="text-blue-600 hover:text-blue-500" style={{ color: colors.primary }}>Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500" style={{ color: colors.primary }}>Privacy Policy</a>
            </span>
          </label>
        </div>
        
        <SubmitButton 
          text="Create Account" 
          loading={loading} 
          disabled={loading}
        />
        
        <motion.div 
          className="mt-6 text-center"
          variants={fadeIn}
        >
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium text-blue-600 hover:text-blue-500"
              style={{ color: colors.primary }}
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
};

export default Register;