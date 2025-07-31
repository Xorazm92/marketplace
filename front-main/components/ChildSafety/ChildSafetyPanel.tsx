import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toast } from 'react-toastify';
import styles from './ChildSafetyPanel.module.scss';

interface SafetySettings {
  ageRestriction: number;
  contentFilter: 'strict' | 'moderate' | 'basic';
  allowedCategories: string[];
  maxSpendingLimit: number;
  requireParentApproval: boolean;
  blockInappropriateContent: boolean;
  timeRestrictions: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    allowedDays: string[];
  };
}

interface ChildAccount {
  id: number;
  name: string;
  age: number;
  avatar?: string;
  settings: SafetySettings;
}

const ChildSafetyPanel: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [childAccounts, setChildAccounts] = useState<ChildAccount[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultSettings: SafetySettings = {
    ageRestriction: 12,
    contentFilter: 'moderate',
    allowedCategories: ['oyinchiqlar', 'kitoblar', 'sport'],
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
    if (user?.role === 'parent') {
      loadChildAccounts();
    }
  }, [user]);

  const loadChildAccounts = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockChildren: ChildAccount[] = [
        {
          id: 1,
          name: 'Ali',
          age: 8,
          settings: defaultSettings
        },
        {
          id: 2,
          name: 'Malika',
          age: 6,
          settings: {
            ...defaultSettings,
            ageRestriction: 6,
            contentFilter: 'strict',
            maxSpendingLimit: 50000
          }
        }
      ];
      
      setChildAccounts(mockChildren);
      if (mockChildren.length > 0) {
        setSelectedChild(mockChildren[0]);
      }
    } catch (error) {
      console.error('Error loading child accounts:', error);
      toast.error('Bolalar hisoblarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (key: keyof SafetySettings, value: any) => {
    if (!selectedChild) return;

    const updatedChild = {
      ...selectedChild,
      settings: {
        ...selectedChild.settings,
        [key]: value
      }
    };

    setSelectedChild(updatedChild);
    
    // Update in the list
    setChildAccounts(prev => 
      prev.map(child => 
        child.id === selectedChild.id ? updatedChild : child
      )
    );
  };

  const handleTimeRestrictionChange = (key: string, value: any) => {
    if (!selectedChild) return;

    const updatedChild = {
      ...selectedChild,
      settings: {
        ...selectedChild.settings,
        timeRestrictions: {
          ...selectedChild.settings.timeRestrictions,
          [key]: value
        }
      }
    };

    setSelectedChild(updatedChild);
    setChildAccounts(prev => 
      prev.map(child => 
        child.id === selectedChild.id ? updatedChild : child
      )
    );
  };

  const saveSettings = async () => {
    if (!selectedChild) return;

    try {
      setSaving(true);
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast.success('Sozlamalar saqlandi');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Sozlamalarni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const addChildAccount = () => {
    const newChild: ChildAccount = {
      id: Date.now(),
      name: 'Yangi bola',
      age: 5,
      settings: defaultSettings
    };

    setChildAccounts(prev => [...prev, newChild]);
    setSelectedChild(newChild);
  };

  if (user?.role !== 'parent') {
    return (
      <div className={styles.accessDenied}>
        <h2>🚫 Ruxsat yo'q</h2>
        <p>Bu bo'lim faqat ota-ona hisobi uchun</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className={styles.safetyPanel}>
      <div className={styles.header}>
        <h1>🛡️ Bolalar Xavfsizligi</h1>
        <p>Bolalaringiz uchun xavfsiz va nazorat ostidagi muhit yarating</p>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.childrenList}>
            <div className={styles.sectionHeader}>
              <h3>Bolalar hisobi</h3>
              <button onClick={addChildAccount} className={styles.addBtn}>
                + Qo'shish
              </button>
            </div>

            {childAccounts.map(child => (
              <div 
                key={child.id}
                className={`${styles.childCard} ${selectedChild?.id === child.id ? styles.active : ''}`}
                onClick={() => setSelectedChild(child)}
              >
                <div className={styles.childAvatar}>
                  {child.avatar ? (
                    <img src={child.avatar} alt={child.name} />
                  ) : (
                    <span>{child.name.charAt(0)}</span>
                  )}
                </div>
                <div className={styles.childInfo}>
                  <h4>{child.name}</h4>
                  <p>{child.age} yosh</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.settingsPanel}>
          {selectedChild ? (
            <>
              <div className={styles.childHeader}>
                <h2>{selectedChild.name} uchun sozlamalar</h2>
                <span className={styles.age}>{selectedChild.age} yosh</span>
              </div>

              <div className={styles.settingsGrid}>
                <div className={styles.settingCard}>
                  <h3>🎂 Yosh cheklovi</h3>
                  <p>Yoshga mos mahsulotlarni ko'rsatish</p>
                  <select 
                    value={selectedChild.settings.ageRestriction}
                    onChange={(e) => handleSettingsChange('ageRestriction', parseInt(e.target.value))}
                  >
                    <option value={3}>3+ yosh</option>
                    <option value={6}>6+ yosh</option>
                    <option value={9}>9+ yosh</option>
                    <option value={12}>12+ yosh</option>
                    <option value={15}>15+ yosh</option>
                  </select>
                </div>

                <div className={styles.settingCard}>
                  <h3>🔍 Kontent filtri</h3>
                  <p>Noto'g'ri kontent darajasi</p>
                  <select 
                    value={selectedChild.settings.contentFilter}
                    onChange={(e) => handleSettingsChange('contentFilter', e.target.value)}
                  >
                    <option value="strict">Qattiq</option>
                    <option value="moderate">O'rtacha</option>
                    <option value="basic">Asosiy</option>
                  </select>
                </div>

                <div className={styles.settingCard}>
                  <h3>💰 Xarajat cheklovi</h3>
                  <p>Maksimal xarajat miqdori</p>
                  <input 
                    type="number"
                    value={selectedChild.settings.maxSpendingLimit}
                    onChange={(e) => handleSettingsChange('maxSpendingLimit', parseInt(e.target.value))}
                    min="0"
                    step="10000"
                  />
                  <span className={styles.currency}>so'm</span>
                </div>

                <div className={styles.settingCard}>
                  <h3>✅ Ota-ona tasdiqi</h3>
                  <p>Xarid uchun ruxsat so'rash</p>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={selectedChild.settings.requireParentApproval}
                      onChange={(e) => handleSettingsChange('requireParentApproval', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.settingCard}>
                  <h3>🚫 Noto'g'ri kontent</h3>
                  <p>Nomaqbul kontentni bloklash</p>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={selectedChild.settings.blockInappropriateContent}
                      onChange={(e) => handleSettingsChange('blockInappropriateContent', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.settingCard}>
                  <h3>⏰ Vaqt cheklovi</h3>
                  <p>Foydalanish vaqtini cheklash</p>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={selectedChild.settings.timeRestrictions.enabled}
                      onChange={(e) => handleTimeRestrictionChange('enabled', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  
                  {selectedChild.settings.timeRestrictions.enabled && (
                    <div className={styles.timeSettings}>
                      <div className={styles.timeRange}>
                        <label>Boshlanish:</label>
                        <input 
                          type="time"
                          value={selectedChild.settings.timeRestrictions.startTime}
                          onChange={(e) => handleTimeRestrictionChange('startTime', e.target.value)}
                        />
                      </div>
                      <div className={styles.timeRange}>
                        <label>Tugash:</label>
                        <input 
                          type="time"
                          value={selectedChild.settings.timeRestrictions.endTime}
                          onChange={(e) => handleTimeRestrictionChange('endTime', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
                <button 
                  onClick={saveSettings}
                  className={styles.saveBtn}
                  disabled={saving}
                >
                  {saving ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noSelection}>
              <h3>Bolani tanlang</h3>
              <p>Sozlamalarni ko'rish uchun chap tarafdan bolani tanlang</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildSafetyPanel;
