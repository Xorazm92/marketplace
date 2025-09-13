
import React, { useState, useEffect } from 'react';
import { ageGroupAPI, AgeGroup } from '../../endpoints/ageGroup';
import styles from './ChildAgeSelector.module.scss';

interface ChildAgeSelectorProps {
  selectedAgeGroup?: number;
  onAgeGroupChange: (ageGroupId: number) => void;
  className?: string;
}

const ChildAgeSelector: React.FC<ChildAgeSelectorProps> = ({
  selectedAgeGroup,
  onAgeGroupChange,
  className
}) => {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgeGroups = async () => {
      try {
        const response = await ageGroupAPI.getAll();
        setAgeGroups(response.data);
      } catch (error) {
        console.error('Error fetching age groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgeGroups();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Yosh guruhlari yuklanmoqda...</div>;
  }

  return (
    <div className={`${styles.ageSelector} ${className || ''}`}>
      <h3>Farzandingiz yoshi</h3>
      <div className={styles.ageGroups}>
        {ageGroups.map((group) => (
          <button
            key={group.id}
            className={`${styles.ageGroup} ${
              selectedAgeGroup === group.id ? styles.selected : ''
            }`}
            onClick={() => onAgeGroupChange(group.id)}
            style={{ backgroundColor: group.color }}
          >
            {group.icon && <span className={styles.icon}>{group.icon}</span>}
            <span className={styles.name}>{group.name}</span>
            <span className={styles.description}>{group.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChildAgeSelector;
