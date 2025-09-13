
import React, { useState } from 'react';
import { ParentalControl } from '../../endpoints/parentalControl';
import styles from './SpendingLimitControl.module.scss';

interface SpendingLimitControlProps {
  parentalControl?: ParentalControl;
  onUpdate: (limits: { spending_limit?: number; daily_spending_limit?: number }) => void;
}

const SpendingLimitControl: React.FC<SpendingLimitControlProps> = ({
  parentalControl,
  onUpdate
}) => {
  const [monthlyLimit, setMonthlyLimit] = useState(
    parentalControl?.spending_limit || 0
  );
  const [dailyLimit, setDailyLimit] = useState(
    parentalControl?.daily_spending_limit || 0
  );
  const [isEnabled, setIsEnabled] = useState(
    !!(parentalControl?.spending_limit || parentalControl?.daily_spending_limit)
  );

  const handleSave = () => {
    onUpdate({
      spending_limit: isEnabled ? monthlyLimit : undefined,
      daily_spending_limit: isEnabled ? dailyLimit : undefined
    });
  };

  return (
    <div className={styles.spendingControl}>
      <div className={styles.header}>
        <h3>Xarajat cheklovlari</h3>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
          <span>Cheklashni yoqish</span>
        </label>
      </div>

      {isEnabled && (
        <div className={styles.limits}>
          <div className={styles.limitGroup}>
            <label>Kunlik limit (so'm)</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              min="0"
              placeholder="Masalan: 50,000"
            />
          </div>

          <div className={styles.limitGroup}>
            <label>Oylik limit (so'm)</label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(Number(e.target.value))}
              min="0"
              placeholder="Masalan: 500,000"
            />
          </div>

          <button className={styles.saveButton} onClick={handleSave}>
            Saqlash
          </button>
        </div>
      )}

      <div className={styles.info}>
        <p>
          <strong>Eslatma:</strong> Bolangiz belgilangan limitdan oshib xarid qila olmaydi.
          Limit tugaganda sizga bildirishnoma yuboriladi.
        </p>
      </div>
    </div>
  );
};

export default SpendingLimitControl;
