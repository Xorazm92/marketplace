import React, { useState, useEffect, useRef } from 'react';
import { 
  MdLocationOn, 
  MdLocalShipping, 
  MdCheckCircle, 
  MdAccessTime,
  MdPhone,
  MdEmail,
  MdNotifications,
  MdRefresh,
  MdMap,
  MdDirections,
  MdMessage,
  MdPrint,
  MdShare,
  MdInfo
} from 'react-icons/md';
import { FiClock, FiMapPin, FiTruck, FiPackage, FiCheck } from 'react-icons/fi';
import styles from './RealTimeOrderTracking.module.scss';

export interface TrackingEvent {
  id: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  title: string;
  description: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  estimatedTime?: string;
  actualTime?: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    photo?: string;
  };
}

export interface OrderDetails {
  id: number;
  orderNumber: string;
  status: string;
  estimatedDelivery: string;
  shippingAddress: string;
  items: Array<{
    id: number;
    title: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  trackingNumber?: string;
  deliveryInstructions?: string;
}

export interface NotificationSettings {
  sms: boolean;
  email: boolean;
  push: boolean;
  phone: string;
  email_address: string;
}

interface RealTimeOrderTrackingProps {
  orderId: number;
  orderDetails: OrderDetails;
  trackingEvents: TrackingEvent[];
  notificationSettings: NotificationSettings;
  onUpdateNotifications: (settings: NotificationSettings) => void;
  onContactDriver?: (driverInfo: any) => void;
  onReportIssue?: () => void;
  className?: string;
  showMap?: boolean;
  refreshInterval?: number;
}

const RealTimeOrderTracking: React.FC<RealTimeOrderTrackingProps> = ({
  orderId,
  orderDetails,
  trackingEvents,
  notificationSettings,
  onUpdateNotifications,
  onContactDriver,
  onReportIssue,
  className = '',
  showMap = true,
  refreshInterval = 30000
}) => {
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout>();

  // Real-time updates
  useEffect(() => {
    if (trackingEvents.length > 0) {
      const latestEvent = trackingEvents[trackingEvents.length - 1];
      setCurrentStatus(latestEvent.status);
      
      // Enable live tracking for active deliveries
      setIsLiveTracking(['shipped', 'in_transit', 'out_for_delivery'].includes(latestEvent.status));
    }
  }, [trackingEvents]);

  // Auto-refresh for live tracking
  useEffect(() => {
    if (isLiveTracking && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        setLastUpdate(new Date());
        // Here you would typically call an API to refresh tracking data
        fetchLatestTrackingData();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isLiveTracking, refreshInterval]);

  const fetchLatestTrackingData = async () => {
    try {
      // Simulate API call
      console.log('Fetching latest tracking data for order:', orderId);
      // In real implementation, this would fetch from your API
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock />;
      case 'confirmed':
        return <MdCheckCircle />;
      case 'processing':
        return <FiPackage />;
      case 'packed':
        return <FiPackage />;
      case 'shipped':
        return <FiTruck />;
      case 'in_transit':
        return <MdLocalShipping />;
      case 'out_for_delivery':
        return <MdDirections />;
      case 'delivered':
        return <FiCheck />;
      default:
        return <FiClock />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#3b82f6';
      case 'processing':
        return '#8b5cf6';
      case 'packed':
        return '#06b6d4';
      case 'shipped':
        return '#10b981';
      case 'in_transit':
        return '#10b981';
      case 'out_for_delivery':
        return '#f97316';
      case 'delivered':
        return '#22c55e';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('uz-UZ'),
      time: date.toLocaleTimeString('uz-UZ', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getCurrentDriverInfo = () => {
    const activeEvent = trackingEvents.find(event => 
      ['shipped', 'in_transit', 'out_for_delivery'].includes(event.status) && event.driverInfo
    );
    return activeEvent?.driverInfo;
  };

  const handleNotificationToggle = (type: keyof NotificationSettings, value: boolean | string) => {
    const updatedSettings = {
      ...notificationSettings,
      [type]: value
    };
    onUpdateNotifications(updatedSettings);
  };

  const generateTrackingUrl = () => {
    return `${window.location.origin}/tracking/${orderDetails.orderNumber}`;
  };

  const shareTracking = async () => {
    const url = generateTrackingUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Buyurtma #${orderDetails.orderNumber} kuzatuvi`,
          text: `Buyurtmangiz holatini kuzatib boring`,
          url
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const driverInfo = getCurrentDriverInfo();

  return (
    <div className={`${styles.trackingContainer} ${className}`}>
      {/* Header */}
      <div className={styles.trackingHeader}>
        <div className={styles.orderInfo}>
          <h2>Buyurtma #{orderDetails.orderNumber}</h2>
          <div className={styles.orderMeta}>
            <span className={styles.currentStatus} style={{ color: getStatusColor(currentStatus) }}>
              {getStatusIcon(currentStatus)}
              <span>{getCurrentStatusText(currentStatus)}</span>
            </span>
            {isLiveTracking && (
              <div className={styles.liveIndicator}>
                <span className={styles.liveDot}></span>
                <span>Jonli kuzatuv</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className={styles.refreshBtn}
            onClick={fetchLatestTrackingData}
            title="Yangilash"
          >
            <MdRefresh />
          </button>
          
          <button 
            className={styles.shareBtn}
            onClick={shareTracking}
            title="Ulashish"
          >
            <MdShare />
          </button>
          
          <button 
            className={styles.notificationBtn}
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            title="Bildirishnoma sozlamalari"
          >
            <MdNotifications />
          </button>
        </div>
      </div>

      {/* Notification Settings Panel */}
      {showNotificationSettings && (
        <div className={styles.notificationPanel}>
          <h4>Bildirishnoma sozlamalari</h4>
          
          <div className={styles.notificationOptions}>
            <div className={styles.notificationOption}>
              <label>
                <input
                  type="checkbox"
                  checked={notificationSettings.sms}
                  onChange={(e) => handleNotificationToggle('sms', e.target.checked)}
                />
                <span>SMS bildirishnomalar</span>
              </label>
              {notificationSettings.sms && (
                <input
                  type="tel"
                  placeholder="Telefon raqam"
                  value={notificationSettings.phone}
                  onChange={(e) => handleNotificationToggle('phone', e.target.value)}
                  className={styles.phoneInput}
                />
              )}
            </div>
            
            <div className={styles.notificationOption}>
              <label>
                <input
                  type="checkbox"
                  checked={notificationSettings.email}
                  onChange={(e) => handleNotificationToggle('email', e.target.checked)}
                />
                <span>Email bildirishnomalar</span>
              </label>
              {notificationSettings.email && (
                <input
                  type="email"
                  placeholder="Email manzil"
                  value={notificationSettings.email_address}
                  onChange={(e) => handleNotificationToggle('email_address', e.target.value)}
                  className={styles.emailInput}
                />
              )}
            </div>
            
            <div className={styles.notificationOption}>
              <label>
                <input
                  type="checkbox"
                  checked={notificationSettings.push}
                  onChange={(e) => handleNotificationToggle('push', e.target.checked)}
                />
                <span>Push bildirishnomalar</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Progress */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <h3>Yetkazib berish jarayoni</h3>
          <span className={styles.lastUpdate}>
            So'nggi yangilanish: {formatDateTime(lastUpdate.toISOString()).time}
          </span>
        </div>
        
        <div className={styles.progressTimeline}>
          {trackingEvents.map((event, index) => {
            const { date, time } = formatDateTime(event.timestamp);
            const isCompleted = index < trackingEvents.length - 1 || event.status === 'delivered';
            const isCurrent = index === trackingEvents.length - 1 && event.status !== 'delivered';
            
            return (
              <div 
                key={event.id}
                className={`${styles.timelineEvent} ${
                  isCompleted ? styles.completed : ''
                } ${isCurrent ? styles.current : ''}`}
              >
                <div className={styles.eventIcon} style={{ backgroundColor: getStatusColor(event.status) }}>
                  {getStatusIcon(event.status)}
                </div>
                
                <div className={styles.eventContent}>
                  <div className={styles.eventHeader}>
                    <h4>{event.title}</h4>
                    <div className={styles.eventTime}>
                      <span className={styles.date}>{date}</span>
                      <span className={styles.time}>{time}</span>
                    </div>
                  </div>
                  
                  <p className={styles.eventDescription}>{event.description}</p>
                  
                  {event.location && (
                    <div className={styles.eventLocation}>
                      <MdLocationOn />
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  {event.estimatedTime && (
                    <div className={styles.estimatedTime}>
                      <MdAccessTime />
                      <span>Taxminiy vaqt: {event.estimatedTime}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Information */}
      {driverInfo && (
        <div className={styles.driverSection}>
          <h3>Haydovchi ma'lumotlari</h3>
          <div className={styles.driverCard}>
            <div className={styles.driverInfo}>
              {driverInfo.photo && (
                <img 
                  src={driverInfo.photo} 
                  alt={driverInfo.name}
                  className={styles.driverPhoto}
                />
              )}
              <div className={styles.driverDetails}>
                <h4>{driverInfo.name}</h4>
                <p>Transport: {driverInfo.vehicleNumber}</p>
              </div>
            </div>
            
            <div className={styles.driverActions}>
              <button 
                className={styles.contactBtn}
                onClick={() => onContactDriver?.(driverInfo)}
              >
                <MdPhone />
                <span>Qo'ng'iroq qilish</span>
              </button>
              
              <button 
                className={styles.messageBtn}
                onClick={() => onContactDriver?.(driverInfo)}
              >
                <MdMessage />
                <span>Xabar yuborish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Section */}
      {showMap && isLiveTracking && (
        <div className={styles.mapSection}>
          <h3>Jonli xarita</h3>
          <div className={styles.mapContainer}>
            {/* This would integrate with a real map service like Google Maps */}
            <div className={styles.mapPlaceholder}>
              <MdMap />
              <p>Xarita yuklanmoqda...</p>
              <span>Buyurtmangizning real vaqtdagi joylashuvi</span>
            </div>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className={styles.orderDetailsSection}>
        <h3>Buyurtma tafsilotlari</h3>
        
        <div className={styles.orderSummary}>
          <div className={styles.deliveryInfo}>
            <h4>Yetkazib berish manzili</h4>
            <p>{orderDetails.shippingAddress}</p>
            
            {orderDetails.deliveryInstructions && (
              <div className={styles.deliveryInstructions}>
                <MdInfo />
                <span>{orderDetails.deliveryInstructions}</span>
              </div>
            )}
          </div>
          
          <div className={styles.orderItems}>
            <h4>Buyurtma mahsulotlari</h4>
            {orderDetails.items.map((item) => (
              <div key={item.id} className={styles.orderItem}>
                <img src={item.image} alt={item.title} />
                <div className={styles.itemInfo}>
                  <h5>{item.title}</h5>
                  <span>Miqdor: {item.quantity}</span>
                </div>
                <div className={styles.itemPrice}>
                  {(item.price * item.quantity).toLocaleString()} so'm
                </div>
              </div>
            ))}
            
            <div className={styles.orderTotal}>
              <strong>Jami: {orderDetails.total.toLocaleString()} so'm</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={styles.footerActions}>
        <button 
          className={styles.reportBtn}
          onClick={onReportIssue}
        >
          Muammo haqida xabar berish
        </button>
        
        <button 
          className={styles.printBtn}
          onClick={() => window.print()}
        >
          <MdPrint />
          <span>Chop etish</span>
        </button>
        
        <button 
          className={styles.helpBtn}
          onClick={() => window.open('/help/tracking', '_blank')}
        >
          Yordam
        </button>
      </div>
    </div>
  );
};

// Helper function to get status text in Uzbek
const getCurrentStatusText = (status: string): string => {
  const statusTexts = {
    'pending': 'Kutilmoqda',
    'confirmed': 'Tasdiqlandi',
    'processing': 'Ishlov berilmoqda',
    'packed': 'Qadoqlandi',
    'shipped': 'Jo\'natildi',
    'in_transit': 'Yo\'lda',
    'out_for_delivery': 'Yetkazib berish uchun',
    'delivered': 'Yetkazib berildi',
    'cancelled': 'Bekor qilindi'
  };
  
  return statusTexts[status] || 'Noma\'lum holat';
};

export default RealTimeOrderTracking;