import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBaby, FaChild, FaGraduationCap, FaBirthdayCake } from 'react-icons/fa';
import { MdCalculate, MdTrendingUp } from 'react-icons/md';

interface AgeCalculatorProps {
  onAgeCalculated: (ageInMonths: number, ageGroup: string) => void;
  className?: string;
}

const AgeCalculator: React.FC<AgeCalculatorProps> = ({ onAgeCalculated, className = '' }) => {
  const [birthDate, setBirthDate] = useState('');
  const [ageInMonths, setAgeInMonths] = useState<number | null>(null);
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.44); // Average days per month
  };

  const getAgeGroup = (months: number): string => {
    if (months <= 6) return 'baby';
    if (months <= 12) return 'infant';
    if (months <= 24) return 'toddler';
    if (months <= 36) return 'preschool';
    if (months <= 60) return 'early';
    if (months <= 84) return 'school';
    return 'teen';
  };

  const getAgeGroupInfo = (group: string) => {
    const groups = {
      baby: { name: '0-6 oy', icon: FaBaby, color: 'bg-ageGroups-baby', description: 'Yangi tug\'ilgan chaqaloqlar' },
      infant: { name: '6-12 oy', icon: FaBaby, color: 'bg-ageGroups-infant', description: 'Chaqaloqlar' },
      toddler: { name: '1-2 yosh', icon: FaChild, color: 'bg-ageGroups-toddler', description: 'Kichik bolalar' },
      preschool: { name: '2-3 yosh', icon: FaChild, color: 'bg-ageGroups-preschool', description: 'O\'rta yoshdagi bolalar' },
      early: { name: '3-5 yosh', icon: FaGraduationCap, color: 'bg-ageGroups-early', description: 'Katta bolalar' },
      school: { name: '5-7 yosh', icon: FaGraduationCap, color: 'bg-ageGroups-school', description: 'Maktab yoshidagi bolalar' },
      teen: { name: '7+ yosh', icon: FaGraduationCap, color: 'bg-ageGroups-teen', description: 'Katta bolalar va o\'smirlar' }
    };
    return groups[group as keyof typeof groups];
  };

  const handleCalculate = () => {
    if (!birthDate) return;
    
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      const months = calculateAge(birthDate);
      const group = getAgeGroup(months);
      
      setAgeInMonths(months);
      setAgeGroup(group);
      onAgeCalculated(months, group);
      setIsCalculating(false);
    }, 1000);
  };

  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <motion.div 
      className={`age-calculator ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <motion.div 
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaBirthdayCake className="text-white text-2xl" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gradient mb-2">
          Yosh Kalkulyatori
        </h3>
        <p className="text-gray-600">
          Bolaning tug'ilgan kunini kiriting va mos mahsulotlarni toping
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tug'ilgan kun
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={maxDate}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            placeholder="YYYY-MM-DD"
          />
        </div>

        <motion.button
          onClick={handleCalculate}
          disabled={!birthDate || isCalculating}
          className="btn-primary w-full flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isCalculating ? (
            <>
              <div className="loading-spinner"></div>
              <span>Hisoblanmoqda...</span>
            </>
          ) : (
            <>
              <MdCalculate className="text-xl" />
              <span>Yoshni hisoblash</span>
            </>
          )}
        </motion.button>

        {ageInMonths !== null && ageGroup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-6 p-6 bg-white rounded-2xl shadow-soft border border-gray-100"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {(() => {
                  const Icon = getAgeGroupInfo(ageGroup).icon;
                  return (
                    <div className={`w-12 h-12 ${getAgeGroupInfo(ageGroup).color} rounded-full flex items-center justify-center mr-3`}>
                      <Icon className="text-white text-xl" />
                    </div>
                  );
                })()}
                <div>
                  <h4 className="text-xl font-bold text-gray-800">
                    {ageInMonths} oy
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getAgeGroupInfo(ageGroup).name}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                {getAgeGroupInfo(ageGroup).description}
              </p>

              <motion.div
                className="flex items-center justify-center space-x-2 text-success-600 font-medium"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <MdTrendingUp className="text-xl" />
                <span>Mos mahsulotlar topildi!</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <FaChild className="mr-2" />
            Yosh guruhlari haqida
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <div>• 0-6 oy: Yangi tug'ilgan</div>
            <div>• 6-12 oy: Chaqaloqlar</div>
            <div>• 1-2 yosh: Kichik bolalar</div>
            <div>• 2-3 yosh: O'rta yosh</div>
            <div>• 3-5 yosh: Katta bolalar</div>
            <div>• 5-7 yosh: Maktab yoshi</div>
            <div>• 7+ yosh: O'smirlar</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AgeCalculator;
