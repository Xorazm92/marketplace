import React from 'react';
import Link from 'next/link';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { MdChildCare } from 'react-icons/md';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      {/* Newsletter Section - Etsy style */}
      <div className={styles.newsletter}>
        <div className={styles.container}>
          <div className={styles.newsletterContent}>
            <div className={styles.newsletterText}>
              <h3>Yangiliklar va maxsus takliflardan xabardor bo'ling</h3>
              <p>Bolalar uchun eng yaxshi mahsulotlar va chegirmalar haqida birinchi bo'lib bilib oling</p>
            </div>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Email manzilingizni kiriting"
                className={styles.emailInput}
              />
              <button className={styles.subscribeBtn}>
                Obuna bo'lish
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          {/* Company Info */}
          <div className={styles.footerSection}>
            <div className={styles.logoSection}>
              <MdChildCare className={styles.logoIcon} />
              <h3 className={styles.sectionTitle}>INBOLA</h3>
            </div>
            <p className={styles.description}>
              Bolalar uchun xavfsiz va ta'limiy marketplace.
              Kichik bizneslardan sifatli mahsulotlar.
            </p>
            <div className={styles.socialLinks}>
              <Link href="#" className={styles.socialLink} title="Facebook">
                <FiFacebook />
              </Link>
              <Link href="#" className={styles.socialLink} title="Instagram">
                <FiInstagram />
              </Link>
              <Link href="#" className={styles.socialLink} title="Twitter">
                <FiTwitter />
              </Link>
              <Link href="#" className={styles.socialLink} title="YouTube">
                <FiYoutube />
              </Link>
            </div>
          </div>

          {/* Shop Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Do'kon</h4>
            <ul className={styles.linkList}>
              <li><Link href="/category/clothing">Kiyim-kechak</Link></li>
              <li><Link href="/category/toys">O'yinchoqlar</Link></li>
              <li><Link href="/category/books">Kitoblar</Link></li>
              <li><Link href="/category/sports">Sport anjomlar</Link></li>
              <li><Link href="/category/school">Maktab buyumlari</Link></li>
              <li><Link href="/deals">Chegirmalar</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Yordam</h4>
            <ul className={styles.linkList}>
              <li><Link href="/help">Yordam markazi</Link></li>
              <li><Link href="/safety">Xavfsizlik</Link></li>
              <li><Link href="/privacy">Maxfiylik siyosati</Link></li>
              <li><Link href="/terms">Foydalanish shartlari</Link></li>
              <li><Link href="/shipping">Yetkazib berish</Link></li>
              <li><Link href="/returns">Qaytarish va almashtirish</Link></li>
            </ul>
          </div>

          {/* Sell Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Sotish</h4>
            <ul className={styles.linkList}>
              <li><Link href="/sell">INBOLA'da sotish</Link></li>
              <li><Link href="/seller-handbook">Sotuvchi qo'llanmasi</Link></li>
              <li><Link href="/teams">Jamoalar</Link></li>
              <li><Link href="/forums">Forumlar</Link></li>
              <li><Link href="/affiliates">Hamkorlar</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.footerSection}>
            <h4 className={styles.sectionTitle}>Aloqa</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <FiPhone className={styles.contactIcon} />
                <span>+998 (90) 123-45-67</span>
              </div>
              <div className={styles.contactItem}>
                <FiMail className={styles.contactIcon} />
                <span>info@inbola.uz</span>
              </div>
              <div className={styles.contactItem}>
                <FiMapPin className={styles.contactIcon} />
                <span>Toshkent, O'zbekiston</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer - Etsy style */}
        <div className={styles.bottomFooter}>
          <div className={styles.bottomContent}>
            <div className={styles.leftContent}>
              <p className={styles.copyright}>
                &copy; 2025 INBOLA, Inc. Barcha huquqlar himoyalangan.
              </p>
              <div className={styles.legalLinks}>
                <Link href="/terms">Shartlar</Link>
                <Link href="/privacy">Maxfiylik</Link>
                <Link href="/cookies">Cookie'lar</Link>
              </div>
            </div>

            <div className={styles.rightContent}>
              <div className={styles.certifications}>
                <div className={styles.certItem}>
                  <span className={styles.certIcon}>🛡️</span>
                  <span>SSL Himoyalangan</span>
                </div>
                <div className={styles.certItem}>
                  <span className={styles.certIcon}>👶</span>
                  <span>Bolalar uchun xavfsiz</span>
                </div>
              </div>

              <div className={styles.languageSelector}>
                <span>🇺🇿 O'zbekiston | O'zbek (UZ) | UZS (so'm)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
