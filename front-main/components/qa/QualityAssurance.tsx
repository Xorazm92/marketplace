import React, { useState, useEffect } from 'react';
import { 
  MdSpeed, 
  MdSecurity, 
  MdAccessibility, 
  MdDevices,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdInfo,
  MdRefresh,
  MdDownload,
  MdVisibility,
  MdBugReport,
  MdNetworkCheck,
  MdWeb,
  MdMobile,
  MdDesktopWindows
} from 'react-icons/md';
import styles from './QualityAssurance.module.scss';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  speed: number; // Speed Index
}

interface SecurityCheck {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  details?: string;
}

interface AccessibilityCheck {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  level: 'A' | 'AA' | 'AAA';
  description: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

interface BrowserTest {
  browser: string;
  version: string;
  status: 'pass' | 'fail' | 'partial';
  issues: string[];
}

interface QualityAssuranceProps {
  onRunTests: () => void;
  onExportReport: () => void;
  className?: string;
}

const QualityAssurance: React.FC<QualityAssuranceProps> = ({
  onRunTests,
  onExportReport,
  className = ''
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'performance' | 'security' | 'accessibility' | 'compatibility'>('performance');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock Performance Metrics
  const [performanceMetrics] = useState<PerformanceMetrics>({
    fcp: 1.2,
    lcp: 2.1,
    fid: 45,
    cls: 0.05,
    ttfb: 0.3,
    speed: 1.8
  });

  // Mock Security Checks
  const [securityChecks] = useState<SecurityCheck[]>([
    {
      id: 'https',
      name: 'HTTPS Sertifikati',
      status: 'pass',
      description: 'SSL/TLS sertifikat to\'g\'ri sozlangan'
    },
    {
      id: 'headers',
      name: 'Xavfsizlik Sarlavhalari',
      status: 'pass',
      description: 'Barcha kerakli xavfsizlik sarlavhalari mavjud'
    },
    {
      id: 'xss',
      name: 'XSS Himoyasi',
      status: 'pass',
      description: 'Cross-site scripting hujumlaridan himoya'
    },
    {
      id: 'csrf',
      name: 'CSRF Himoyasi',
      status: 'pass',
      description: 'Cross-site request forgery himoyasi'
    },
    {
      id: 'csp',
      name: 'Content Security Policy',
      status: 'warning',
      description: 'CSP sozlamalarini yaxshilash kerak',
      details: 'Ba\'zi static resurslar uchun CSP qoidalarini kengaytirish tavsiya etiladi'
    }
  ]);

  // Mock Accessibility Checks
  const [accessibilityChecks] = useState<AccessibilityCheck[]>([
    {
      id: 'contrast',
      name: 'Rang Kontrasti',
      status: 'pass',
      level: 'AA',
      description: 'Barcha matnlarda yetarli rang kontrasti',
      impact: 'serious'
    },
    {
      id: 'alt-text',
      name: 'Rasm Alt Matni',
      status: 'pass',
      level: 'A',
      description: 'Barcha rasmlarda alt matn mavjud',
      impact: 'critical'
    },
    {
      id: 'keyboard',
      name: 'Klaviatura Navigatsiyasi',
      status: 'pass',
      level: 'A',
      description: 'Barcha elementlar klaviatura orqali foydalanish mumkin',
      impact: 'serious'
    },
    {
      id: 'aria',
      name: 'ARIA Atributlari',
      status: 'warning',
      level: 'AA',
      description: 'Ba\'zi elementlarda ARIA yorliqlari etishmayapti',
      impact: 'moderate'
    },
    {
      id: 'headings',
      name: 'Sarlavha Ierarxiyasi',
      status: 'pass',
      level: 'AA',
      description: 'Sarlavhalar to\'g\'ri tartibda joylashgan',
      impact: 'moderate'
    }
  ]);

  // Mock Browser Compatibility
  const [browserTests] = useState<BrowserTest[]>([
    {
      browser: 'Chrome',
      version: '91+',
      status: 'pass',
      issues: []
    },
    {
      browser: 'Firefox',
      version: '89+',
      status: 'pass',
      issues: []
    },
    {
      browser: 'Safari',
      version: '14+',
      status: 'partial',
      issues: ['Ba\'zi CSS Grid xususiyatlari to\'liq ishlamaydi']
    },
    {
      browser: 'Edge',
      version: '91+',
      status: 'pass',
      issues: []
    },
    {
      browser: 'Mobile Safari',
      version: '14+',
      status: 'pass',
      issues: []
    },
    {
      browser: 'Chrome Mobile',
      version: '91+',
      status: 'pass',
      issues: []
    }
  ]);

  const getPerformanceScore = () => {
    const { fcp, lcp, fid, cls } = performanceMetrics;
    let score = 100;
    
    // FCP penalty
    if (fcp > 3) score -= 20;
    else if (fcp > 1.8) score -= 10;
    
    // LCP penalty
    if (lcp > 4) score -= 25;
    else if (lcp > 2.5) score -= 15;
    
    // FID penalty
    if (fid > 300) score -= 20;
    else if (fid > 100) score -= 10;
    
    // CLS penalty
    if (cls > 0.25) score -= 15;
    else if (cls > 0.1) score -= 8;
    
    return Math.max(0, Math.round(score));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <MdCheckCircle className={styles.iconPass} />;
      case 'fail': return <MdError className={styles.iconFail} />;
      case 'warning': return <MdWarning className={styles.iconWarning} />;
      default: return <MdInfo className={styles.iconInfo} />;
    }
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    await onRunTests();
    setLastUpdated(new Date());
    setTimeout(() => setIsRunning(false), 2000);
  };

  const PerformanceTab = () => (
    <div className={styles.performanceTab}>
      <div className={styles.scoreCard}>
        <div className={styles.mainScore}>
          <div 
            className={styles.scoreCircle}
            style={{ '--score-color': getScoreColor(getPerformanceScore()) } as React.CSSProperties}
          >
            <span className={styles.scoreNumber}>{getPerformanceScore()}</span>
            <span className={styles.scoreLabel}>Performance</span>
          </div>
        </div>
        <div className={styles.scoreDescription}>
          <h3>Umumiy Performance Bahosi</h3>
          <p>Lighthouse va Core Web Vitals asosida hisoblangan</p>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h4>First Contentful Paint</h4>
            <span className={`${styles.metricValue} ${performanceMetrics.fcp <= 1.8 ? styles.good : performanceMetrics.fcp <= 3 ? styles.needsImprovement : styles.poor}`}>
              {performanceMetrics.fcp}s
            </span>
          </div>
          <div className={styles.metricBar}>
            <div 
              className={styles.metricProgress}
              style={{ width: `${Math.min((performanceMetrics.fcp / 4) * 100, 100)}%` }}
            />
          </div>
          <p className={styles.metricDescription}>
            Birinchi kontent ko'rinish vaqti
          </p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h4>Largest Contentful Paint</h4>
            <span className={`${styles.metricValue} ${performanceMetrics.lcp <= 2.5 ? styles.good : performanceMetrics.lcp <= 4 ? styles.needsImprovement : styles.poor}`}>
              {performanceMetrics.lcp}s
            </span>
          </div>
          <div className={styles.metricBar}>
            <div 
              className={styles.metricProgress}
              style={{ width: `${Math.min((performanceMetrics.lcp / 5) * 100, 100)}%` }}
            />
          </div>
          <p className={styles.metricDescription}>
            Eng katta kontent ko'rinish vaqti
          </p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h4>First Input Delay</h4>
            <span className={`${styles.metricValue} ${performanceMetrics.fid <= 100 ? styles.good : performanceMetrics.fid <= 300 ? styles.needsImprovement : styles.poor}`}>
              {performanceMetrics.fid}ms
            </span>
          </div>
          <div className={styles.metricBar}>
            <div 
              className={styles.metricProgress}
              style={{ width: `${Math.min((performanceMetrics.fid / 400) * 100, 100)}%` }}
            />
          </div>
          <p className={styles.metricDescription}>
            Birinchi interaktiv javob vaqti
          </p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h4>Cumulative Layout Shift</h4>
            <span className={`${styles.metricValue} ${performanceMetrics.cls <= 0.1 ? styles.good : performanceMetrics.cls <= 0.25 ? styles.needsImprovement : styles.poor}`}>
              {performanceMetrics.cls}
            </span>
          </div>
          <div className={styles.metricBar}>
            <div 
              className={styles.metricProgress}
              style={{ width: `${Math.min((performanceMetrics.cls / 0.5) * 100, 100)}%` }}
            />
          </div>
          <p className={styles.metricDescription}>
            Tartibsiz layout o'zgarishlari
          </p>
        </div>
      </div>

      <div className={styles.recommendationsCard}>
        <h3>Tavsiyalar</h3>
        <div className={styles.recommendationsList}>
          <div className={styles.recommendation}>
            <MdInfo className={styles.recommendationIcon} />
            <div>
              <h4>Rasmlarni optimallashtirish</h4>
              <p>Next.js Image komponentidan foydalaning va WebP formatini qo'llang</p>
            </div>
          </div>
          <div className={styles.recommendation}>
            <MdInfo className={styles.recommendationIcon} />
            <div>
              <h4>JavaScript bundle hajmini kamaytirish</h4>
              <p>Code splitting va dynamic import-lardan foydalaning</p>
            </div>
          </div>
          <div className={styles.recommendation}>
            <MdInfo className={styles.recommendationIcon} />
            <div>
              <h4>Critical CSS inline qilish</h4>
              <p>Above-the-fold kontent uchun kritik CSS-ni inline qiling</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className={styles.securityTab}>
      <div className={styles.securitySummary}>
        <div className={styles.securityScore}>
          <MdSecurity className={styles.securityIcon} />
          <div>
            <h3>Xavfsizlik Holati</h3>
            <div className={styles.securityStatus}>
              <span className={styles.statusIndicator}>
                {securityChecks.filter(c => c.status === 'pass').length} / {securityChecks.length} Test O'tdi
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.checksGrid}>
        {securityChecks.map((check) => (
          <div key={check.id} className={`${styles.checkCard} ${styles[check.status]}`}>
            <div className={styles.checkHeader}>
              {getStatusIcon(check.status)}
              <h4>{check.name}</h4>
            </div>
            <p className={styles.checkDescription}>{check.description}</p>
            {check.details && (
              <div className={styles.checkDetails}>
                <strong>Tafsilotlar:</strong> {check.details}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const AccessibilityTab = () => (
    <div className={styles.accessibilityTab}>
      <div className={styles.accessibilitySummary}>
        <div className={styles.accessibilityScore}>
          <MdAccessibility className={styles.accessibilityIcon} />
          <div>
            <h3>Accessibility (WCAG 2.1)</h3>
            <div className={styles.complianceLevel}>
              <span>AA Level Compliance</span>
              <div className={styles.levelBadges}>
                <span className={styles.levelBadge}>A ✓</span>
                <span className={styles.levelBadge}>AA ✓</span>
                <span className={`${styles.levelBadge} ${styles.partial}`}>AAA ⚠</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.checksGrid}>
        {accessibilityChecks.map((check) => (
          <div key={check.id} className={`${styles.checkCard} ${styles[check.status]}`}>
            <div className={styles.checkHeader}>
              {getStatusIcon(check.status)}
              <h4>{check.name}</h4>
              <span className={styles.levelTag}>{check.level}</span>
            </div>
            <p className={styles.checkDescription}>{check.description}</p>
            <div className={styles.checkMeta}>
              <span className={`${styles.impactTag} ${styles[check.impact]}`}>
                {check.impact} impact
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CompatibilityTab = () => (
    <div className={styles.compatibilityTab}>
      <div className={styles.compatibilitySummary}>
        <div className={styles.platformGrid}>
          <div className={styles.platformCard}>
            <MdDesktopWindows className={styles.platformIcon} />
            <h4>Desktop</h4>
            <div className={styles.supportStatus}>
              {browserTests.filter(b => !b.browser.includes('Mobile')).map(test => (
                <div key={test.browser} className={`${styles.browserTest} ${styles[test.status]}`}>
                  <span>{test.browser}</span>
                  {getStatusIcon(test.status)}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.platformCard}>
            <MdMobile className={styles.platformIcon} />
            <h4>Mobile</h4>
            <div className={styles.supportStatus}>
              {browserTests.filter(b => b.browser.includes('Mobile')).map(test => (
                <div key={test.browser} className={`${styles.browserTest} ${styles[test.status]}`}>
                  <span>{test.browser}</span>
                  {getStatusIcon(test.status)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.browserDetailsGrid}>
        {browserTests.map((test) => (
          <div key={`${test.browser}-${test.version}`} className={`${styles.browserCard} ${styles[test.status]}`}>
            <div className={styles.browserHeader}>
              <h4>{test.browser} {test.version}</h4>
              {getStatusIcon(test.status)}
            </div>
            {test.issues.length > 0 && (
              <div className={styles.browserIssues}>
                <h5>Aniqlangan muammolar:</h5>
                <ul>
                  {test.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`${styles.qualityAssurance} ${className}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Quality Assurance Dashboard</h1>
          <p>Comprehensive testing and monitoring for INBOLA Kids Marketplace</p>
          <div className={styles.lastUpdated}>
            So'nggi yangilanish: {lastUpdated.toLocaleString('uz-UZ')}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={handleRunTests}
            disabled={isRunning}
            className={styles.runTestsBtn}
          >
            <MdRefresh className={isRunning ? styles.spinning : ''} />
            {isRunning ? 'Testlar o\'tkazilmoqda...' : 'Testlarni qayta ishga tushirish'}
          </button>
          <button onClick={onExportReport} className={styles.exportBtn}>
            <MdDownload />
            Hisobotni eksport qilish
          </button>
        </div>
      </div>

      <div className={styles.tabNavigation}>
        {[
          { id: 'performance', label: 'Performance', icon: MdSpeed },
          { id: 'security', label: 'Security', icon: MdSecurity },
          { id: 'accessibility', label: 'Accessibility', icon: MdAccessibility },
          { id: 'compatibility', label: 'Browser Test', icon: MdDevices }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
          >
            <tab.icon className={styles.tabIcon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'accessibility' && <AccessibilityTab />}
        {activeTab === 'compatibility' && <CompatibilityTab />}
      </div>
    </div>
  );
};

export default QualityAssurance;