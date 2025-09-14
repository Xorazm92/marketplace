import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Language, detectLanguage, setLanguage, getLocalizedUrl } from '../../utils/i18n';
import styles from './LanguageSwitcher.module.scss';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'buttons' | 'compact';
  showFlags?: boolean;
  showLabels?: boolean;
}

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  country: string;
}

const languages: LanguageOption[] = [
  {
    code: 'uz',
    name: 'Uzbek',
    nativeName: 'O\\'zbek',
    flag: '🇺🇿',
    country: 'Uzbekistan'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    country: 'Russia'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    country: 'United States'
  }
];

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'dropdown',
  showFlags = true,
  showLabels = true
}) => {
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('uz');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const detected = detectLanguage();
    setCurrentLanguage(detected);
  }, []);

  useEffect(() => {
    if (mounted) {
      const path = router.asPath;
      if (path.startsWith('/ru')) {
        setCurrentLanguage('ru');
      } else if (path.startsWith('/en')) {
        setCurrentLanguage('en');
      } else {
        setCurrentLanguage('uz');
      }
    }
  }, [router.asPath, mounted]);

  const handleLanguageChange = async (newLanguage: Language) => {
    if (newLanguage === currentLanguage) return;

    // Save to localStorage
    setLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
    setIsOpen(false);

    // Generate new URL
    const newUrl = getLocalizedUrl(router.asPath, newLanguage);
    
    // Navigate to new URL
    await router.push(newUrl);

    // Track language change for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'language_change', {
        event_category: 'User Interaction',
        event_label: `${currentLanguage} → ${newLanguage}`,
        value: 1
      });
    }
  };

  const getCurrentLanguageData = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  const getOtherLanguages = () => {
    return languages.filter(lang => lang.code !== currentLanguage);
  };

  if (!mounted) {
    return (
      <div className={`${styles.languageSwitcher} ${styles[variant]} ${className}`}>
        <div className={styles.loading}>🌐</div>
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`${styles.languageSwitcher} ${styles.buttons} ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`${styles.languageButton} ${
              lang.code === currentLanguage ? styles.active : ''
            }`}
            onClick={() => handleLanguageChange(lang.code)}
            title={`Switch to ${lang.name}`}
            aria-label={`Switch to ${lang.name}`}
          >
            {showFlags && <span className={styles.flag}>{lang.flag}</span>}
            {showLabels && (
              <span className={styles.label}>
                {lang.code.toUpperCase()}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`${styles.languageSwitcher} ${styles.compact} ${className}`}>
        <button
          className={styles.compactButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup=\"listbox\"
          title=\"Change language\"
        >
          {showFlags && (
            <span className={styles.flag}>{getCurrentLanguageData().flag}</span>
          )}
          <span className={styles.code}>{currentLanguage.toUpperCase()}</span>
          <span className={styles.arrow}>▼</span>
        </button>
        
        {isOpen && (
          <div className={styles.compactDropdown}>
            {getOtherLanguages().map((lang) => (
              <button
                key={lang.code}
                className={styles.compactOption}
                onClick={() => handleLanguageChange(lang.code)}
                role=\"option\"
                aria-selected={false}
              >
                {showFlags && <span className={styles.flag}>{lang.flag}</span>}
                <span className={styles.code}>{lang.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`${styles.languageSwitcher} ${styles.dropdown} ${className}`}>
      <button
        className={styles.dropdownTrigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup=\"listbox\"
        title=\"Change language\"
      >
        <div className={styles.currentLanguage}>
          {showFlags && (
            <span className={styles.flag}>{getCurrentLanguageData().flag}</span>
          )}
          {showLabels && (
            <span className={styles.languageName}>
              {getCurrentLanguageData().nativeName}
            </span>
          )}
          <span className={styles.chevron}>▼</span>
        </div>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role=\"listbox\">
          {getOtherLanguages().map((lang) => (
            <button
              key={lang.code}
              className={styles.dropdownOption}
              onClick={() => handleLanguageChange(lang.code)}
              role=\"option\"
              aria-selected={false}
              title={`Switch to ${lang.name}`}
            >
              <div className={styles.languageOption}>
                {showFlags && <span className={styles.flag}>{lang.flag}</span>}
                <div className={styles.languageInfo}>
                  <span className={styles.nativeName}>{lang.nativeName}</span>
                  <span className={styles.englishName}>{lang.name}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setIsOpen(false)}
          aria-hidden=\"true\"
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;"