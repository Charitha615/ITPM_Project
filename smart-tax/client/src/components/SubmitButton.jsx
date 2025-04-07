import { motion } from 'framer-motion';
import { itemVariants } from '../styles/animations';
import { colors } from '../styles/theme';

const SubmitButton = ({ 
  text, 
  loading, 
  disabled,
  onClick 
}) => {
  return (
    <motion.button
      type="submit"
      className={`w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        disabled ? 'bg-gray-400 cursor-not-allowed' : `bg-${colors.primary} hover:bg-${colors.secondary}`
      }`}
      style={{
        background: disabled ? colors.gray : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      }}
      variants={itemVariants}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : (
        text
      )}
    </motion.button>
  );
};

export default SubmitButton;