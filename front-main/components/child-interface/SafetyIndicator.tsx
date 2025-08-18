import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { MdSecurity, MdVerified } from 'react-icons/md';

interface SafetyCertification {
  name: string;
  code: string;
  description: string;
  logo?: string;
}

interface SafetyIndicatorProps {
  product: {
    id: number;
    title: string;
    safety_score?: number;
    certifications?: SafetyCertification[];
    safety_info?: string;
    safety_warnings?: string;
    choking_hazard?: boolean;
    assembly_required?: boolean;
    battery_required?: boolean;
    parental_guidance?: boolean;
  };
  className?: string;
}

const SafetyIndicator: React.FC<SafetyIndicatorProps> = ({ product, className = '' }) => {
  const safetyScore = product.safety_score || 4;
  const certifications = product.certifications || [];
  
  const getSafetyColor = (score: number) => {
    if (score >= 4) return 'text-success-600 bg-success-50 border-success-200';
    if (score >= 3) return 'text-warning-600 bg-warning-50 border-warning-200';
    return 'text-danger-600 bg-danger-50 border-danger-200';
  };

  const getSafetyIcon = (score: number) => {
    if (score >= 4) return FaCheckCircle;
    if (score >= 3) return FaExclamationTriangle;
    return FaExclamationTriangle;
  };

  const getSafetyText = (score: number) => {
    if (score >= 4) return 'Juda xavfsiz';
    if (score >= 3) return 'Xavfsiz';
    return 'Ehtiyot bo'lish kerak';
  };

  const SafetyIcon = getSafetyIcon(safetyScore);

  return (
    <motion.div 
      className={`safety-indicator ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <motion.div 
            className={`w-16 h-16 rounded-full flex items-center justify-center ${getSafetyColor(safetyScore)}`}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <SafetyIcon className="text-2xl" />
          </motion.div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-lg font-bold text-gray-800">
              Xavfsizlik ko'rsatkichi
            </h4>
            <MdVerified className="text-success-500 text-xl" />
          </div>
          
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < safetyScore ? 'bg-success-500' : 'bg-gray-300'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
            <span className={`font-semibold ${getSafetyColor(safetyScore).split(' ')[0]}`}>
              {safetyScore}/5 - {getSafetyText(safetyScore)}
            </span>
          </div>

          {certifications.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaShieldAlt className="mr-1" />
                Sertifikatlar:
              </h5>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, index) => (
                  <motion.span
                    key={cert.code}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {cert.code}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {product.safety_info && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <FaInfoCircle className="mr-1" />
                Xavfsizlik ma'lumoti:
              </h5>
              <p className="text-sm text-gray-600">{product.safety_info}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {product.choking_hazard && (
              <motion.div 
                className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg border border-red-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FaExclamationTriangle className="text-red-500" />
                <span className="text-xs text-red-700">Bo'g'ilish xavfi</span>
              </motion.div>
            )}
            
            {product.assembly_required && (
              <motion.div 
                className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FaInfoCircle className="text-blue-500" />
                <span className="text-xs text-blue-700">Yig'ish kerak</span>
              </motion.div>
            )}
            
            {product.battery_required && (
              <motion.div 
                className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <FaInfoCircle className="text-yellow-500" />
                <span className="text-xs text-yellow-700">Batareya kerak</span>
              </motion.div>
            )}
            
            {product.parental_guidance && (
              <motion.div 
                className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg border border-purple-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <FaShieldAlt className="text-purple-500" />
                <span className="text-xs text-purple-700">Ota-ona nazorati</span>
              </motion.div>
            )}
          </div>

          {product.safety_warnings && (
            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <h5 className="text-sm font-semibold text-orange-800 mb-1 flex items-center">
                <FaExclamationTriangle className="mr-1" />
                Ogohlantirish:
              </h5>
              <p className="text-sm text-orange-700">{product.safety_warnings}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MdSecurity className="text-success-500 text-lg" />
            <span className="text-sm text-gray-600">Xavfsizlik kafolatlangan</span>
          </div>
          <motion.button
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Batafsil ma'lumot
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SafetyIndicator;
