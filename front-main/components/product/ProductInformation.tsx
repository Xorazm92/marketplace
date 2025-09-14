import React, { useState } from 'react';
import {
  FiInfo,
  FiShield,
  FiPackage,
  FiTruck,
  FiRefreshCw,
  FiStar,
  FiCalendar,
  FiCheckCircle,
  FiAlertTriangle,
  FiAward,
  FiUsers
} from 'react-icons/fi';
import {
  MdChildCare,
  MdSecurity,
  MdLocalShipping,
  MdVerifiedUser,
  MdWarning,
  MdRecycling,
  MdBiotech
} from 'react-icons/md';
import { FaCertificate, FaLeaf, FaHeart } from 'react-icons/fa';
import { TrustBadge, ProductSafetyBadge } from '../common/TrustBadges';
import styles from './ProductInformation.module.scss';

interface Material {
  name: string;
  percentage: number;
  safety: 'safe' | 'caution' | 'approved';
  certification?: string;
  description?: string;
}

interface SafetyInfo {
  ageRange: string;
  chokeHazard: boolean;
  allergens: string[];
  warnings: string[];
  certifications: string[];
  testingLab: string;
  testDate: string;
  compliance: string[];
}

interface CareInstructions {
  washing: string;
  drying: string;
  storage: string;
  maintenance: string[];
}

interface ProductInformationProps {
  description: string;
  materials: Material[];
  safetyInfo: SafetyInfo;
  careInstructions: CareInstructions;
  features: string[];
  specifications: Record<string, string>;
  ageRange: string;
  brand: string;
  category: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  warranty: {
    duration: string;
    coverage: string;
    terms: string;
  };
  origin: {
    country: string;
    manufacturer: string;
    factoryInfo?: string;
  };
  environmental: {
    recyclable: boolean;
    sustainable: boolean;
    carbonNeutral: boolean;
    ecoFriendly: boolean;
  };
}

const ProductInformation: React.FC<ProductInformationProps> = ({
  description,
  materials,
  safetyInfo,
  careInstructions,
  features,
  specifications,
  ageRange,
  brand,
  category,
  dimensions,
  warranty,
  origin,
  environmental
}) => {
  const [activeTab, setActiveTab] = useState('description');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const tabs = [
    { id: 'description', label: 'Tavsif', icon: <FiInfo /> },
    { id: 'materials', label: 'Materiallar', icon: <MdBiotech /> },
    { id: 'safety', label: 'Xavfsizlik', icon: <FiShield /> },
    { id: 'care', label: 'Parvarish', icon: <FiRefreshCw /> },
    { id: 'specifications', label: 'Texnik ma\\'lumotlar', icon: <FiPackage /> },
    { id: 'warranty', label: 'Kafolat', icon: <FiAward /> }
  ];

  const getMaterialSafetyColor = (safety: string) => {
    switch (safety) {
      case 'safe': return '#22c55e';
      case 'approved': return '#3b82f6';
      case 'caution': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatDimensions = () => {
    return `${dimensions.length} × ${dimensions.width} × ${dimensions.height} sm`;
  };

  return (
    <div className={styles.productInformation}>
      {/* Product Safety Overview */}
      <div className={styles.safetyOverview}>
        <ProductSafetyBadge
          ageRange={ageRange}
          certified={safetyInfo.certifications.length > 0}
          parentApproved={true}
          safetyRating={5}
        />
        
        <div className={styles.quickSafetyInfo}>
          {!safetyInfo.chokeHazard && (
            <div className={styles.safetyItem}>
              <FiCheckCircle className={styles.safeIcon} />
              <span>Bo\\'g\\'ilish xavfi yo\\'q</span>
            </div>
          )}
          
          {safetyInfo.allergens.length === 0 && (
            <div className={styles.safetyItem}>
              <FiCheckCircle className={styles.safeIcon} />
              <span>Allergen xavfsiz</span>
            </div>
          )}
          
          {environmental.ecoFriendly && (
            <div className={styles.safetyItem}>
              <FaLeaf className={styles.ecoIcon} />
              <span>Atrof-muhitga zarar yo\\'q</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className={styles.descriptionContent}>
            <div className={styles.mainDescription}>
              <h3>Mahsulot haqida</h3>
              <p>{description}</p>
            </div>
            
            {features.length > 0 && (
              <div className={styles.featuresSection}>
                <h4>Asosiy xususiyatlar</h4>
                <ul className={styles.featuresList}>
                  {features.map((feature, index) => (
                    <li key={index}>
                      <FiCheckCircle />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className={styles.brandInfo}>
              <h4>Brend ma\\'lumotlari</h4>
              <div className={styles.brandDetails}>
                <div className={styles.brandItem}>
                  <strong>Brend:</strong>
                  <span>{brand}</span>
                </div>
                <div className={styles.brandItem}>
                  <strong>Kategoriya:</strong>
                  <span>{category}</span>
                </div>
                <div className={styles.brandItem}>
                  <strong>Ishlab chiqarilgan:</strong>
                  <span>{origin.country}</span>
                </div>
                <div className={styles.brandItem}>
                  <strong>Ishlab chiqaruvchi:</strong>
                  <span>{origin.manufacturer}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className={styles.materialsContent}>
            <div className={styles.materialsHeader}>
              <h3>Materiallar tarkibi</h3>
              <p>Barcha materiallar bolalar xavfsizligi standartlariga javob beradi</p>
            </div>
            
            <div className={styles.materialsList}>
              {materials.map((material, index) => (
                <div key={index} className={styles.materialItem}>
                  <div className={styles.materialHeader}>
                    <div className={styles.materialName}>
                      <span className={styles.name}>{material.name}</span>
                      <span 
                        className={styles.percentage}
                        style={{ color: getMaterialSafetyColor(material.safety) }}
                      >
                        {material.percentage}%
                      </span>
                    </div>
                    
                    <div className={styles.materialSafety}>
                      <span 
                        className={`${styles.safetyBadge} ${styles[material.safety]}`}
                        style={{ backgroundColor: getMaterialSafetyColor(material.safety) }}
                      >
                        {material.safety === 'safe' && 'Xavfsiz'}
                        {material.safety === 'approved' && 'Tasdiqlangan'}
                        {material.safety === 'caution' && 'Ehtiyotkorlik'}
                      </span>
                    </div>
                  </div>
                  
                  {material.description && (
                    <p className={styles.materialDescription}>{material.description}</p>
                  )}
                  
                  {material.certification && (
                    <div className={styles.materialCertification}>
                      <FaCertificate />
                      <span>{material.certification}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Environmental Info */}
            <div className={styles.environmentalInfo}>
              <h4>Atrof-muhit va barqarorlik</h4>
              <div className={styles.environmentalBadges}>
                {environmental.recyclable && (
                  <div className={styles.envBadge}>
                    <MdRecycling />
                    <span>Qayta ishlanuvchi</span>
                  </div>
                )}
                {environmental.sustainable && (
                  <div className={styles.envBadge}>
                    <FaLeaf />
                    <span>Barqaror ishlab chiqarish</span>
                  </div>
                )}
                {environmental.carbonNeutral && (
                  <div className={styles.envBadge}>
                    <FiShield />
                    <span>Karbon neytral</span>
                  </div>
                )}
                {environmental.ecoFriendly && (
                  <div className={styles.envBadge}>
                    <FaHeart />
                    <span>Eco-friendly</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Safety Tab */}
        {activeTab === 'safety' && (
          <div className={styles.safetyContent}>
            <div className={styles.safetyHeader}>
              <h3>Bolalar xavfsizligi</h3>
              <p>Ushbu mahsulot eng yuqori xavfsizlik standartlariga javob beradi</p>
            </div>
            
            <div className={styles.ageRecommendation}>
              <div className={styles.ageIcon}>
                <MdChildCare />
              </div>
              <div>
                <h4>Tavsiya etilgan yosh</h4>
                <p>{safetyInfo.ageRange}</p>
              </div>
            </div>
            
            {/* Safety Certifications */}
            <div className={styles.certifications}>
              <h4>Xavfsizlik sertifikatlari</h4>
              <div className={styles.certificationsList}>
                {safetyInfo.certifications.map((cert, index) => (
                  <div key={index} className={styles.certificationItem}>
                    <FaCertificate />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Safety Warnings */}
            {safetyInfo.warnings.length > 0 && (
              <div className={styles.warnings}>
                <h4>Muhim ogohlantirishlar</h4>
                <div className={styles.warningsList}>
                  {safetyInfo.warnings.map((warning, index) => (
                    <div key={index} className={styles.warningItem}>
                      <MdWarning />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Testing Information */}
            <div className={styles.testingInfo}>
              <h4>Sinov ma\\'lumotlari</h4>
              <div className={styles.testingDetails}>
                <div className={styles.testingItem}>
                  <strong>Sinov laboratoriyasi:</strong>
                  <span>{safetyInfo.testingLab}</span>
                </div>
                <div className={styles.testingItem}>
                  <strong>Sinov sanasi:</strong>
                  <span>{safetyInfo.testDate}</span>
                </div>
                <div className={styles.testingItem}>
                  <strong>Standartlarga muvofiqlik:</strong>
                  <div className={styles.complianceList}>
                    {safetyInfo.compliance.map((item, index) => (
                      <span key={index} className={styles.complianceItem}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Care Instructions Tab */}
        {activeTab === 'care' && (
          <div className={styles.careContent}>
            <div className={styles.careHeader}>
              <h3>Parvarish qo\\'llanmasi</h3>
              <p>Mahsulotning uzoq muddat xizmat qilishi uchun quyidagi ko\\'rsatmalarga rioya qiling</p>
            </div>
            
            <div className={styles.careInstructions}>
              <div className={styles.careItem}>
                <div className={styles.careIcon}>
                  <FiRefreshCw />
                </div>
                <div>
                  <h4>Yuvish</h4>
                  <p>{careInstructions.washing}</p>
                </div>
              </div>
              
              <div className={styles.careItem}>
                <div className={styles.careIcon}>
                  <FiPackage />
                </div>
                <div>
                  <h4>Quritish</h4>
                  <p>{careInstructions.drying}</p>
                </div>
              </div>
              
              <div className={styles.careItem}>
                <div className={styles.careIcon}>
                  <MdLocalShipping />
                </div>
                <div>
                  <h4>Saqlash</h4>
                  <p>{careInstructions.storage}</p>
                </div>
              </div>
            </div>
            
            {careInstructions.maintenance.length > 0 && (
              <div className={styles.maintenanceTips}>
                <h4>Parvarish maslahatlari</h4>
                <ul>
                  {careInstructions.maintenance.map((tip, index) => (
                    <li key={index}>
                      <FiCheckCircle />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === 'specifications' && (
          <div className={styles.specificationsContent}>
            <h3>Texnik xususiyatlar</h3>
            
            <div className={styles.specsGrid}>
              <div className={styles.specsSection}>
                <h4>O\\'lchamlar</h4>
                <div className={styles.specsList}>
                  <div className={styles.specItem}>
                    <span>O\\'lchamlari:</span>
                    <span>{formatDimensions()}</span>
                  </div>
                  <div className={styles.specItem}>
                    <span>Og\\'irligi:</span>
                    <span>{dimensions.weight} g</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.specsSection}>
                <h4>Qo\\'shimcha ma\\'lumotlar</h4>
                <div className={styles.specsList}>
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className={styles.specItem}>
                      <span>{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warranty Tab */}
        {activeTab === 'warranty' && (
          <div className={styles.warrantyContent}>
            <div className={styles.warrantyHeader}>
              <h3>Kafolat ma\\'lumotlari</h3>
              <p>Mahsulot sifati va xizmat muddati kafolatlanadi</p>
            </div>
            
            <div className={styles.warrantyDetails}>
              <div className={styles.warrantyItem}>
                <div className={styles.warrantyIcon}>
                  <FiAward />
                </div>
                <div>
                  <h4>Kafolat muddati</h4>
                  <p>{warranty.duration}</p>
                </div>
              </div>
              
              <div className={styles.warrantyItem}>
                <div className={styles.warrantyIcon}>
                  <FiShield />
                </div>
                <div>
                  <h4>Kafolat qamrovi</h4>
                  <p>{warranty.coverage}</p>
                </div>
              </div>
              
              <div className={styles.warrantyTerms}>
                <h4>Kafolat shartlari</h4>
                <p>{warranty.terms}</p>
              </div>
            </div>
            
            <div className={styles.supportInfo}>
              <h4>Qo\\'llab-quvvatlash</h4>
              <p>Savollaringiz bo\\'lsa, bizning 24/7 qo\\'llab-quvvatlash xizmatiga murojaat qiling.</p>
              <div className={styles.supportContact}>
                <div className={styles.contactItem}>
                  <FiUsers />
                  <span>support@inbola.uz</span>
                </div>
                <div className={styles.contactItem}>
                  <FiPackage />
                  <span>+998 90 123 45 67</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInformation;