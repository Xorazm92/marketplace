import React, { useState } from 'react';
import styles from './Settings.module.scss';
import { toast } from 'react-toastify';

interface SettingsData {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderNotifications: boolean;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    siteName: 'INBOLA - Bolalar uchun marketplace',
    siteDescription: 'Bolalar uchun eng sifatli mahsulotlar',
    contactEmail: 'info@inbola.uz',
    contactPhone: '+998 71 123 45 67',
    address: 'Toshkent sh., Yunusobod tumani',
    currency: 'UZS',
    language: 'uz',
    timezone: 'Asia/Tashkent',
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxFileSize: 50,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp']
  });

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleArrayChange = (name: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setSettings(prev => ({
      ...prev,
      [name]: array
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Sozlamalar muvaffaqiyatli saqlandi!');
    } catch (error) {
      toast.error('Sozlamalarni saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Umumiy', icon: '🏢' },
    { id: 'notifications', label: 'Bildirishnomalar', icon: '🔔' },
    { id: 'security', label: 'Xavfsizlik', icon: '🔒' },
    { id: 'files', label: 'Fayllar', icon: '📁' }
  ];

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h2>⚙️ Tizim sozlamalari</h2>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>

      <div className={styles.settingsContainer}>
        <div className={styles.tabsContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'general' && (
            <div className={styles.tabPanel}>
              <h3>Umumiy sozlamalar</h3>

              <div className={styles.formGroup}>
                <label>Sayt nomi</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleInputChange}
                  placeholder="Sayt nomini kiriting"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Sayt tavsifi</label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleInputChange}
                  placeholder="Sayt haqida qisqacha ma'lumot"
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Aloqa email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleInputChange}
                    placeholder="info@example.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Aloqa telefoni</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={settings.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+998 71 123 45 67"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Manzil</label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
                  placeholder="To'liq manzilni kiriting"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Valyuta</label>
                  <select
                    name="currency"
                    value={settings.currency}
                    onChange={handleInputChange}
                  >
                    <option value="UZS">O'zbek so'mi (UZS)</option>
                    <option value="USD">Dollar (USD)</option>
                    <option value="EUR">Evro (EUR)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Til</label>
                  <select
                    name="language"
                    value={settings.language}
                    onChange={handleInputChange}
                  >
                    <option value="uz">O'zbek tili</option>
                    <option value="ru">Rus tili</option>
                    <option value="en">Ingliz tili</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Vaqt zonasi</label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleInputChange}
                >
                  <option value="Asia/Tashkent">Toshkent (UTC+5)</option>
                  <option value="Asia/Almaty">Almaty (UTC+6)</option>
                  <option value="Europe/Moscow">Moskva (UTC+3)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className={styles.tabPanel}>
              <h3>Bildirishnoma sozlamalari</h3>

              <div className={styles.switchGroup}>
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <h4>Email bildirishnomalar</h4>
                    <p>Yangi buyurtmalar va muhim hodisalar haqida email orqali xabar berish</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleInputChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <h4>SMS bildirishnomalar</h4>
                    <p>Muhim hodisalar haqida SMS orqali xabar berish</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={settings.smsNotifications}
                      onChange={handleInputChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <h4>Buyurtma bildirishnomalar</h4>
                    <p>Yangi buyurtmalar haqida real vaqtda xabar berish</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="orderNotifications"
                      checked={settings.orderNotifications}
                      onChange={handleInputChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className={styles.tabPanel}>
              <h3>Xavfsizlik sozlamalari</h3>

              <div className={styles.switchGroup}>
                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <h4>Texnik ishlar rejimi</h4>
                    <p>Saytni vaqtincha yopish (faqat adminlar kira oladi)</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleInputChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <h4>Ro'yxatdan o'tishga ruxsat</h4>
                    <p>Yangi foydalanuvchilarning ro'yxatdan o'tishiga ruxsat berish</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="allowRegistration"
                      checked={settings.allowRegistration}
                      onChange={handleInputChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.switchItem}>
                  <div className={styles.switchInfo}>
                    <h4>Email tasdiqlash</h4>
                    <p>Ro'yxatdan o'tishda email manzilini tasdiqlashni talab qilish</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      name="requireEmailVerification"
                      checked={settings.requireEmailVerification}
                      onChange={handleInputChange}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className={styles.tabPanel}>
              <h3>Fayl sozlamalari</h3>

              <div className={styles.formGroup}>
                <label>Maksimal fayl hajmi (MB)</label>
                <input
                  type="number"
                  name="maxFileSize"
                  value={settings.maxFileSize}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                />
                <small>Rasm yuklash uchun maksimal hajm</small>
              </div>

              <div className={styles.formGroup}>
                <label>Ruxsat etilgan fayl turlari</label>
                <input
                  type="text"
                  value={settings.allowedFileTypes.join(', ')}
                  onChange={(e) => handleArrayChange('allowedFileTypes', e.target.value)}
                  placeholder="jpg, jpeg, png, webp"
                />
                <small>Vergul bilan ajrating (masalan: jpg, png, webp)</small>
              </div>

              <div className={styles.fileTypesPreview}>
                <h4>Joriy ruxsat etilgan turlar:</h4>
                <div className={styles.fileTypesList}>
                  {settings.allowedFileTypes.map((type, index) => (
                    <span key={index} className={styles.fileType}>
                      .{type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
