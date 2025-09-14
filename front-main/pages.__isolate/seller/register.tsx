
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { registerSeller } from '../../endpoints/seller';
import styles from '../../styles/SellerRegister.module.scss';

const businessCategories = [
  'Electronics',
  'Fashion & Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Food & Beverage',
  'Other',
];

interface SellerFormData {
  company_name: string;
  business_registration: string;
  tax_id: string;
  email: string;
  phone: string;
  business_address: string;
  description: string;
  website: string;
  business_categories: string[];
  bank_account: string;
  bank_name: string;
}

const SellerRegister: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SellerFormData>({
    company_name: '',
    business_registration: '',
    tax_id: '',
    email: '',
    phone: '',
    business_address: '',
    description: '',
    website: '',
    business_categories: [],
    bank_account: '',
    bank_name: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      business_categories: prev.business_categories.includes(category)
        ? prev.business_categories.filter(c => c !== category)
        : [...prev.business_categories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!formData.company_name || !formData.business_registration || !formData.email) {
        toast.error('Iltimos, majburiy maydonlarni to\'ldiring');
        return;
      }

      if (formData.business_categories.length === 0) {
        toast.error('Kamida bitta biznes kategoriyasini tanlang');
        return;
      }

      await registerSeller(formData);
      toast.success('Sotuvchi ro\'yxatdan o\'tish muvaffaqiyatli yuborildi!');
      router.push('/seller/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Sotuvchi bo'lib ro'yxatdan o'ting</h1>
        <p>INBOLA marketplace'da o'z biznesingizni boshlang</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h2>Kompaniya ma'lumotlari</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="company_name">Kompaniya nomi *</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="business_registration">Biznes ro'yxatga olish raqami *</label>
              <input
                type="text"
                id="business_registration"
                name="business_registration"
                value={formData.business_registration}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tax_id">Soliq raqami *</label>
              <input
                type="text"
                id="tax_id"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Kompaniya tavsifi</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Sizning biznesingiz haqida qisqacha ma'lumot..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="website">Veb-sayt</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2>Aloqa ma'lumotlari</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email manzil *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Telefon raqam *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+998 90 123 45 67"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="business_address">Biznes manzil *</label>
            <textarea
              id="business_address"
              name="business_address"
              value={formData.business_address}
              onChange={handleInputChange}
              required
              rows={3}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2>Biznes kategoriyalari *</h2>
          <div className={styles.categoryGrid}>
            {businessCategories.map(category => (
              <label key={category} className={styles.categoryItem}>
                <input
                  type="checkbox"
                  checked={formData.business_categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Bank ma'lumotlari</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="bank_name">Bank nomi *</label>
              <input
                type="text"
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bank_account">Bank hisob raqami *</label>
              <input
                type="text"
                id="bank_account"
                name="bank_account"
                value={formData.bank_account}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.cancelBtn}
            onClick={() => router.back()}
          >
            Bekor qilish
          </button>
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Yuborilmoqda...' : 'Ro\'yxatdan o\'tish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerRegister;
