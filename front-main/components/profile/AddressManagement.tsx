import React, { useState } from 'react';
import styles from './AddressManagement.module.scss';

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  isDefault: boolean;
  type: 'home' | 'office' | 'other';
}

interface AddressManagementProps {
  userId: number;
}

// Mock data - real loyihada API dan keladi
const mockAddresses: Address[] = [
  {
    id: 1,
    name: 'Malika Karimova',
    phone: '+998 90 123 45 67',
    address: 'Yunusobod tumani, 15-uy, 25-kvartira',
    city: 'Toshkent',
    region: 'Toshkent shahri',
    postalCode: '100000',
    isDefault: true,
    type: 'home'
  },
  {
    id: 2,
    name: 'Malika Karimova (Ish)',
    phone: '+998 90 123 45 67',
    address: 'Mirzo Ulug\'bek tumani, IT Park, 2-bino',
    city: 'Toshkent',
    region: 'Toshkent shahri',
    postalCode: '100000',
    isDefault: false,
    type: 'office'
  }
];

const AddressManagement: React.FC<AddressManagementProps> = ({ userId }) => {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    name: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    type: 'home',
    isDefault: false
  });

  const addressTypes = [
    { value: 'home', label: 'Uy', icon: '🏠' },
    { value: 'office', label: 'Ish', icon: '🏢' },
    { value: 'other', label: 'Boshqa', icon: '📍' }
  ];

  const regions = [
    'Toshkent shahri',
    'Toshkent viloyati',
    'Samarqand viloyati',
    'Buxoro viloyati',
    'Andijon viloyati',
    'Farg\'ona viloyati',
    'Namangan viloyati',
    'Qashqadaryo viloyati',
    'Surxondaryo viloyati',
    'Navoiy viloyati',
    'Jizzax viloyati',
    'Sirdaryo viloyati',
    'Xorazm viloyati',
    'Qoraqalpog\'iston Respublikasi'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...formData } as Address
          : addr
      ));
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now(),
        ...formData as Address
      };
      setAddresses(prev => [...prev, newAddress]);
    }

    // Reset form
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      region: '',
      postalCode: '',
      type: 'home',
      isDefault: false
    });
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowAddForm(true);
  };

  const handleDelete = (addressId: number) => {
    if (window.confirm('Bu manzilni o\'chirishni xohlaysizmi?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    }
  };

  const handleSetDefault = (addressId: number) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };

  const getAddressTypeInfo = (type: string) => {
    return addressTypes.find(t => t.value === type) || addressTypes[0];
  };

  return (
    <div className={styles.addressManagement}>
      <div className={styles.header}>
        <h2>Manzillar</h2>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          + Yangi manzil qo'shish
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📍</div>
          <h3>Manzillar yo'q</h3>
          <p>Yetkazib berish uchun manzil qo'shing.</p>
          <button 
            className={styles.addFirstButton}
            onClick={() => setShowAddForm(true)}
          >
            Birinchi manzilni qo'shish
          </button>
        </div>
      ) : (
        <div className={styles.addressList}>
          {addresses.map((address) => {
            const typeInfo = getAddressTypeInfo(address.type);
            return (
              <div key={address.id} className={styles.addressCard}>
                <div className={styles.addressHeader}>
                  <div className={styles.addressType}>
                    <span className={styles.typeIcon}>{typeInfo.icon}</span>
                    <span className={styles.typeName}>{typeInfo.label}</span>
                    {address.isDefault && (
                      <span className={styles.defaultBadge}>Asosiy</span>
                    )}
                  </div>
                  <div className={styles.addressActions}>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleEdit(address)}
                    >
                      ✏️
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(address.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className={styles.addressContent}>
                  <h4 className={styles.addressName}>{address.name}</h4>
                  <p className={styles.addressPhone}>{address.phone}</p>
                  <p className={styles.addressText}>
                    {address.address}<br />
                    {address.city}, {address.region}<br />
                    {address.postalCode}
                  </p>
                </div>

                {!address.isDefault && (
                  <div className={styles.addressFooter}>
                    <button 
                      className={styles.setDefaultButton}
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Asosiy qilish
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddForm && (
        <div className={styles.addressModal}>
          <div className={styles.modalOverlay} onClick={() => {
            setShowAddForm(false);
            setEditingAddress(null);
            setFormData({
              name: '',
              phone: '',
              address: '',
              city: '',
              region: '',
              postalCode: '',
              type: 'home',
              isDefault: false
            });
          }}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingAddress ? 'Manzilni tahrirlash' : 'Yangi manzil qo\'shish'}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAddress(null);
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.addressForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>To'liq ism</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ism va familiya"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Telefon raqam</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Manzil</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Ko'cha, uy raqami, kvartira"
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Shahar</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Shahar nomi"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Viloyat</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Viloyatni tanlang</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Pochta indeksi</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="100000"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Manzil turi</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    {addressTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />
                  <span>Bu manzilni asosiy qilish</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                  }}
                >
                  Bekor qilish
                </button>
                <button type="submit" className={styles.saveButton}>
                  {editingAddress ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;
