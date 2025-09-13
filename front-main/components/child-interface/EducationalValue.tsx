import React from 'react';
// @ts-ignore - Framer Motion types will be available after installation
import { motion } from 'framer-motion';
import { FaGraduationCap, FaLightbulb, FaBrain, FaUsers, FaHeart, FaStar } from 'react-icons/fa';
import { MdScience, MdSports, MdLanguage, MdNature } from 'react-icons/md';

interface EducationalValueProps {
  product: {
    id: number;
    title: string;
    educational_value?: string;
    learning_objectives?: string[];
    developmental_skills?: string[];
    difficulty_level?: string;
    play_time?: string;
    player_count?: string;
    educational_category?: {
      name: string;
      description: string;
      color: string;
    };
  };
  className?: string;
}

const EducationalValue: React.FC<EducationalValueProps> = ({ product, className = '' }) => {
  const learningObjectives = product.learning_objectives || [];
  const developmentalSkills = product.developmental_skills || [];
  
  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'oson': return 'text-success-600 bg-success-50 border-success-200';
      case 'orta': return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'qiyin': return 'text-danger-600 bg-danger-50 border-danger-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'stem': return MdScience;
      case 'sport': return MdSports;
      case 'language': return MdLanguage;
      case 'nature': return MdNature;
      default: return FaGraduationCap;
    }
  };

  const CategoryIcon = getCategoryIcon(product.educational_category?.name || '');

  return (
    <motion.div 
      className={`edu-value ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaGraduationCap className="text-white text-2xl" />
          </motion.div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <h4 className="text-lg font-bold text-gray-800">
              Ta'limiy qiymati
            </h4>
            <FaStar className="text-accent-500 text-xl" />
          </div>

          {product.educational_category && (
            <motion.div 
              className="mb-4 p-3 bg-white rounded-xl border border-gray-200"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${product.educational_category.color} rounded-full flex items-center justify-center`}>
                  <CategoryIcon className="text-white text-lg" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800">
                    {product.educational_category.name}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {product.educational_category.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {product.educational_value && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaLightbulb className="mr-2 text-accent-500" />
                Ta'limiy foyda:
              </h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.educational_value}
              </p>
            </div>
          )}

          {learningObjectives.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaBrain className="mr-2 text-primary-500" />
                O'quv maqsadlari:
              </h5>
              <div className="space-y-2">
                {learningObjectives.map((objective, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">{objective}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {developmentalSkills.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaHeart className="mr-2 text-success-500" />
                Rivojlanish ko'nikmalari:
              </h5>
              <div className="flex flex-wrap gap-2">
                {developmentalSkills.map((skill, index) => (
                  <motion.span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {product.difficulty_level && (
              <motion.div 
                className={`p-3 rounded-xl border ${getDifficultyColor(product.difficulty_level)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h6 className="text-xs font-semibold mb-1">Qiyinlik darajasi</h6>
                <p className="text-sm font-medium">{product.difficulty_level}</p>
              </motion.div>
            )}
            
            {product.play_time && (
              <motion.div 
                className="p-3 rounded-xl border border-blue-200 bg-blue-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h6 className="text-xs font-semibold mb-1 text-blue-700">O'yin vaqti</h6>
                <p className="text-sm font-medium text-blue-800">{product.play_time}</p>
              </motion.div>
            )}
            
            {product.player_count && (
              <motion.div 
                className="p-3 rounded-xl border border-purple-200 bg-purple-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h6 className="text-xs font-semibold mb-1 text-purple-700 flex items-center">
                  <FaUsers className="mr-1" />
                  O'yinchilar
                </h6>
                <p className="text-sm font-medium text-purple-800">{product.player_count}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaGraduationCap className="text-primary-500 text-lg" />
            <span className="text-sm text-gray-600">Ta'limiy mahsulot tasdiqlangan</span>
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

export default EducationalValue;
