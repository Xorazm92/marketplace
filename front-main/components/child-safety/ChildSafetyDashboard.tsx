
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { ChildProfile, ParentalControl, parentalControlAPI, childProfileAPI } from '../../endpoints/parentalControl';
import { ageGroupAPI, AgeGroup } from '../../endpoints/ageGroup';
import { safetyCertificationAPI, SafetyCertification } from '../../endpoints/safetyCertification';
import ChildAgeSelector from './ChildAgeSelector';
import SpendingLimitControl from '../parental-control/SpendingLimitControl';
import toast from 'react-hot-toast';
import styles from './ChildSafetyDashboard.module.scss';

interface TimeRestriction {
  enabled: boolean;
  startTime: string;
  endTime: string;
  allowedDays: string[];
}

interface SafetySettings {
  ageRestriction: number;
  contentFilter: 'strict' | 'moderate' | 'lenient';
  allowedCategories: string[];
  maxSpendingLimit: number;
  requireParentApproval: boolean;
  blockInappropriateContent: boolean;
  timeRestrictions: TimeRestriction;
}

const ChildSafetyDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [parentalControls, setParentalControls] = useState<ParentalControl[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [certifications, setCertifications] = useState<SafetyCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);

  const defaultSettings: SafetySettings = {
    ageRestriction: 12,
    contentFilter: 'moderate',
    allowedCategories: ['toys', 'books', 'education', 'sports'],
    maxSpendingLimit: 100000,
    requireParentApproval: true,
    blockInappropriateContent: true,
    timeRestrictions: {
      enabled: false,
      startTime: '09:00',
      endTime: '21:00',
      allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load child profiles
      const childResponse = await childProfileAPI.getByParent(user.id);
      setChildProfiles(childResponse.data);
      
      // Load parental controls
      const controlsResponse = await parentalControlAPI.getByUser(user.id);
      setParentalControls(controlsResponse.data);
      
      // Load age groups
      const ageResponse = await ageGroupAPI.getAll();
      setAgeGroups(ageResponse.data);
      
      // Load safety certifications
      const certResponse = await safetyCertificationAPI.getAll();
      setCertifications(certResponse.data);
      
      if (childResponse.data.length > 0) {
        setSelectedChild(childResponse.data[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (childData: Partial<ChildProfile>) => {
    try {
      setSaving(true);
      const newChild = await childProfileAPI.create({
        ...childData,
        parent_id: user.id,
        is_active: true
      });
      setChildProfiles(prev => [...prev, newChild.data]);
      setSelectedChild(newChild.data);
      setShowAddChild(false);
      toast.success('Farzand profili yaratildi');
    } catch (error) {
      console.error('Error creating child profile:', error);
      toast.error('Farzand profilini yaratishda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateParentalControl = async (controlData: Partial<ParentalControl>) => {
    if (!selectedChild) return;

    try {
      setSaving(true);
      const existingControl = parentalControls.find(pc => pc.child_profile_id === selectedChild.id);
      
      if (existingControl) {
        await parentalControlAPI.update(existingControl.id, controlData);
      } else {
        await parentalControlAPI.create({
          ...controlData,
          user_id: user.id,
          child_profile_id: selectedChild.id,
          is_active: true
        });
      }
      
      // Reload controls
      const controlsResponse = await parentalControlAPI.getByUser(user.id);
      setParentalControls(controlsResponse.data);
      
      toast.success('Nazorat sozlamalari saqlandi');
    } catch (error) {
      console.error('Error updating parental control:', error);
      toast.error('Sozlamalarni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const getChildControl = (childId: number) => {
    return parentalControls.find(pc => pc.child_profile_id === childId);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>🛡️ Bolalar Xavfsizligi Boshqaruvi</h1>
        <p>Farzandlaringiz uchun xavfsiz va ta'limiy muhit yarating</p>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.childList}>
            <div className={styles.sectionHeader}>
              <h3>Farzandlar</h3>
              <button 
                className={styles.addButton}
                onClick={() => setShowAddChild(true)}
              >
                + Qo'shish
              </button>
            </div>
            
            {childProfiles.map(child => (
              <div 
                key={child.id}
                className={`${styles.childCard} ${
                  selectedChild?.id === child.id ? styles.selected : ''
                }`}
                onClick={() => setSelectedChild(child)}
              >
                <div className={styles.childAvatar}>
                  {child.avatar ? (
                    <img src={child.avatar} alt={child.name} />
                  ) : (
                    <div className={styles.defaultAvatar}>
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.childInfo}>
                  <h4>{child.name}</h4>
                  <p>{new Date().getFullYear() - new Date(child.birth_date).getFullYear()} yosh</p>
                  {getChildControl(child.id) && (
                    <span className={styles.controlActive}>Nazorat faol</span>
                  )}
                </div>
              </div>
            ))}
            
            {childProfiles.length === 0 && (
              <div className={styles.emptyState}>
                <p>Hali farzand profili yo'q</p>
                <button 
                  className={styles.primaryButton}
                  onClick={() => setShowAddChild(true)}
                >
                  Birinchi profilni yarating
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.mainContent}>
          {selectedChild ? (
            <div className={styles.controlPanel}>
              <div className={styles.childHeader}>
                <h2>{selectedChild.name} uchun sozlamalar</h2>
                <span className={styles.age}>
                  {new Date().getFullYear() - new Date(selectedChild.birth_date).getFullYear()} yosh
                </span>
              </div>

              <div className={styles.sections}>
                {/* Age Group Selection */}
                <div className={styles.section}>
                  <ChildAgeSelector
                    selectedAgeGroup={getChildControl(selectedChild.id)?.age_group_id}
                    onAgeGroupChange={(ageGroupId) => {
                      handleUpdateParentalControl({ age_group_id: ageGroupId });
                    }}
                  />
                </div>

                {/* Spending Limits */}
                <div className={styles.section}>
                  <SpendingLimitControl
                    dailyLimit={getChildControl(selectedChild.id)?.daily_spending_limit || 0}
                    totalLimit={getChildControl(selectedChild.id)?.spending_limit || 0}
                    onLimitsChange={(daily, total) => {
                      handleUpdateParentalControl({
                        daily_spending_limit: daily,
                        spending_limit: total
                      });
                    }}
                  />
                </div>

                {/* Content Filtering */}
                <div className={styles.section}>
                  <h3>Kontent Filtrlash</h3>
                  <div className={styles.filterOptions}>
                    {['strict', 'moderate', 'lenient'].map(level => (
                      <label key={level} className={styles.radioOption}>
                        <input
                          type="radio"
                          name="contentFilter"
                          value={level}
                          checked={getChildControl(selectedChild.id)?.content_filter === level}
                          onChange={(e) => {
                            handleUpdateParentalControl({ content_filter: e.target.value });
                          }}
                        />
                        <span className={styles.radioLabel}>
                          {level === 'strict' && '🔒 Qattiq'}
                          {level === 'moderate' && '⚖️ O\'rtacha'}
                          {level === 'lenient' && '🔓 Yumshoq'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Restrictions */}
                <div className={styles.section}>
                  <h3>Vaqt Cheklovlari</h3>
                  <div className={styles.timeControls}>
                    <label className={styles.checkboxOption}>
                      <input
                        type="checkbox"
                        checked={getChildControl(selectedChild.id)?.time_restrictions?.enabled || false}
                        onChange={(e) => {
                          const currentRestrictions = getChildControl(selectedChild.id)?.time_restrictions || {};
                          handleUpdateParentalControl({
                            time_restrictions: {
                              ...currentRestrictions,
                              enabled: e.target.checked
                            }
                          });
                        }}
                      />
                      <span>Vaqt cheklovlarini yoqish</span>
                    </label>
                    
                    {getChildControl(selectedChild.id)?.time_restrictions?.enabled && (
                      <div className={styles.timeInputs}>
                        <div className={styles.timeRange}>
                          <label>
                            Boshlanish vaqti:
                            <input
                              type="time"
                              value={getChildControl(selectedChild.id)?.time_restrictions?.start_time || '09:00'}
                              onChange={(e) => {
                                const currentRestrictions = getChildControl(selectedChild.id)?.time_restrictions || {};
                                handleUpdateParentalControl({
                                  time_restrictions: {
                                    ...currentRestrictions,
                                    start_time: e.target.value
                                  }
                                });
                              }}
                            />
                          </label>
                          <label>
                            Tugash vaqti:
                            <input
                              type="time"
                              value={getChildControl(selectedChild.id)?.time_restrictions?.end_time || '21:00'}
                              onChange={(e) => {
                                const currentRestrictions = getChildControl(selectedChild.id)?.time_restrictions || {};
                                handleUpdateParentalControl({
                                  time_restrictions: {
                                    ...currentRestrictions,
                                    end_time: e.target.value
                                  }
                                });
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noSelection}>
              <h3>Farzand tanlang</h3>
              <p>Sozlamalarni ko'rish va boshqarish uchun farzandingizni tanlang</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddChild && (
        <AddChildModal
          onClose={() => setShowAddChild(false)}
          onSubmit={handleAddChild}
          saving={saving}
        />
      )}
    </div>
  );
};

// Add Child Modal Component
interface AddChildModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<ChildProfile>) => void;
  saving: boolean;
}

const AddChildModal: React.FC<AddChildModalProps> = ({ onClose, onSubmit, saving }) => {
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: '',
    interests: [],
    allergies: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.birth_date) {
      onSubmit(formData);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Yangi Farzand Qo'shish</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Ism *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Tug'ilgan sana *</label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Jins</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="">Tanlang</option>
              <option value="male">O'g'il bola</option>
              <option value="female">Qiz bola</option>
            </select>
          </div>
          
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Bekor qilish
            </button>
            <button type="submit" disabled={saving} className={styles.submitButton}>
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChildSafetyDashboard;
