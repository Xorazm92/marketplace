import React, { useState, useEffect } from 'react';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Modal from '../../ui/Modal';
import styles from './PhoneSection.module.scss';
import { getPhones, addPhone, deletePhone } from '../../../../endpoints/phones';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';

type Phone = {
  id: number;
  _id: string;
  phone_number: string;
};

const PhoneSection = () => {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const fetchPhones = async (id: number | undefined) => {
    setLoading(true);
    const data = await getPhones(id);
    if (process.env.NODE_ENV === "development") console.log("dara: ", data);
    if (data) setPhones(data);
    if (process.env.NODE_ENV === "development") console.log('data: ', data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPhones(user?.id);
  }, [user?.id]);

  const handleAddPhone = async () => {
    if (!newPhone.trim()) return;

    const added = await addPhone(newPhone.trim(), user?.id);
    if (added) {
      setPhones((prev) => [...prev, added]);
      setNewPhone('');
      setShowForm(false);
    }
  };

  const handleDeletePhone = async (phoneId: number) => {
    if (process.env.NODE_ENV === "development") console.log('delete bosildi');
    const confirmed = window.confirm('Ишончингиз комилми?');
    if (!confirmed) return;

    const res = await deletePhone(user?.id, +phoneId);
    if (res == false) {
      toast('something went wrong on deleting');
    } else {
      if (process.env.NODE_ENV === "development") console.log('res: ', res);
      setPhones((prev) => prev.filter((item) => item.id !== phoneId));
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.item} onClick={() => setOpen(!open)}>
          <span>Номер телефона</span>
          <span className={styles.arrow}>
            {open ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>

        {open && (
          <div className={styles.subsection}>
            {loading ? (
              <div className={styles.loader}>Юкланмоқда...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {phones.map((phone, index) => (
                    <tr key={phone.id}>
                      <th>{index + 1}</th>
                      <th>{phone.phone_number}</th>
                      <th>
                        <div
                          className={`${styles.item} ${styles.delete}`}
                          onClick={() => handleDeletePhone(phone.id)}
                        >
                          <RiDeleteBin5Line />
                        </div>
                      </th>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className={styles.addButtonLine}>
              <div
                className={styles.addButton}
                onClick={() => setShowForm(true)}
              >
                <div>+ Добавить номер телефона</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h3 className={styles.modalTitle}>Добавить номер</h3>
        <input
          type="text"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          placeholder="Введите свой номер телефона"
          className={styles.input}
        />
        <button onClick={handleAddPhone} className={styles.button}>
          Получить код
        </button>
      </Modal>
    </>
  );
};

export default PhoneSection;
