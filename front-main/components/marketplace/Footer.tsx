import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          {/* Company Info */}
          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>INBOLA</h3>
            <p className={styles.description}>
              Bolalar uchun eng yaxshi mahsulotlar - kiyim, o'yinchoqlar, 
              ta'lim materiallari va boshqa zarur narsalar.
            </p>
            <div className={styles.socialLinks}>
              <Link href="#" className={styles.socialLink}>
                <span>📘</span>
              </Link>
              <Link href="#" className={styles.socialLink}>
                <span>📷</span>
              </Link>
              <Link href="#" className={styles.socialLink}>
                <span>🐦</span>
              </Link>
              <Link href="#" className={styles.socialLink}>
                <span>📺</span>
              </Link>
            </div>
          </div>

          {/* Shop Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Do'kon</h4>
            <ul className={styles.linkList}>
              <li><Link href="/category/kiyim">Kiyim</Link></li>
              <li><Link href="/category/oyinchoqlar">O'yinchoqlar</Link></li>
              <li><Link href="/category/kitoblar">Kitoblar</Link></li>
              <li><Link href="/category/sport">Sport</Link></li>
              <li><Link href="/category/maktab">Maktab buyumlari</Link></li>
              <li><Link href="/deals">Chegirmalar</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Yordam</h4>
            <ul className={styles.linkList}>
              <li><Link href="/help">Yordam markazi</Link></li>
              <li><Link href="/privacy">Maxfiylik siyosati</Link></li>
              <li><Link href="/terms">Foydalanish shartlari</Link></li>
              <li><Link href="/shipping">Yetkazib berish</Link></li>
              <li><Link href="/returns">Qaytarish</Link></li>
              <li><Link href="/contact">Aloqa</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Hisob</h4>
            <ul className={styles.linkList}>
              <li><Link href="/login">Kirish</Link></li>
              <li><Link href="/register">Ro'yxatdan o'tish</Link></li>
              <li><Link href="/account">Mening hisobim</Link></li>
              <li><Link href="/orders">Buyurtmalarim</Link></li>
              <li><Link href="/wishlist">Sevimlilar</Link></li>
              <li><Link href="/cart">Savatcha</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Yangiliklar</h4>
            <p className={styles.newsletterText}>
              Yangi mahsulotlar va chegirmalar haqida birinchi bo'lib xabar oling
            </p>
            <form className={styles.newsletterForm}>
              <input 
                type="email" 
                placeholder="Email manzilingiz"
                className={styles.emailInput}
              />
              <button type="submit" className={styles.subscribeButton}>
                Obuna bo'lish
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className={styles.bottomFooter}>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <p>&copy; 2024 INBOLA. Barcha huquqlar himoyalangan.</p>
            </div>
            <div className={styles.paymentMethods}>
              <span>To'lov usullari:</span>
              <div className={styles.paymentIcons}>
                <span>💳</span>
                <span>🏦</span>
                <span>📱</span>
                <span>💰</span>
              </div>
            </div>
            <div className={styles.language}>
              <select className={styles.languageSelect}>
                <option value="uz">🇺🇿 O'zbek</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
