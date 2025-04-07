import { motion } from 'framer-motion';
import { itemVariants } from '../styles/animations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const InputField = ({ 
  type, 
  name, 
  placeholder, 
  icon, 
  value, 
  onChange, 
  error 
}) => {
  return (
    <motion.div className="mb-4" variants={itemVariants}>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={icon} className="text-gray-400" />
          </div>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full py-3 px-4 ${icon ? 'pl-10' : 'pl-4'} border rounded-lg focus:outline-none focus:ring-2 ${
            error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
          }`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </motion.div>
  );
};

export default InputField;