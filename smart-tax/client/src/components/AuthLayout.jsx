import { motion } from 'framer-motion';
import { containerVariants } from '../styles/animations';
import { colors } from '../styles/theme';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold text-gray-800 mb-2"
              variants={containerVariants}
            >
              {title}
            </motion.h1>
            <motion.p 
              className="text-gray-600"
              variants={containerVariants}
            >
              {subtitle}
            </motion.p>
          </div>
          {children}
        </div>
        <div 
          className="h-2 bg-gradient-to-r from-blue-400 to-indigo-600"
          style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }}
        ></div>
      </motion.div>
    </motion.div>
  );
};

export default AuthLayout;