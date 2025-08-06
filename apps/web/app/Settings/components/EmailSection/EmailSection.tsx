import React, { useState, useEffect } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Modal from "../../ui/Modal";
import styles from "./EmailSection.module.scss";
import {
  getEmails,
  addEmail as apiAddEmail,
  deleteEmail as apiDeleteEmail,
} from '../../../../endpoints/emails';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { toast } from 'react-toastify';
import { MdGppBad, MdOutlineGppGood } from 'react-icons/md';


type Email = {
  id: number;
  user_id: number;
  email: string;
  is_verified: boolean
};

const EmailSection = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchEmails = async (userId: number | undefined) => {
    setLoading(true);
    const data = await getEmails(userId);
    console.log("emails:  :", userId);
    console.log("emails:  :", data);
    if (data && Array.isArray(data)) {
      setEmails(data);
      console.log("emails: ", data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails(user?.id);
  }, [user?.id]);

  const addEmail = async () => {
    if (!newEmail.trim()) return;
    const added = await apiAddEmail(user?.id, newEmail.trim());
    if (added) {
      setEmails((prev) => [...prev, added]);
      setNewEmail("");
      setShowForm(false);
    }
  };

  const deleteEmail = async (id: string) => {
    const confirmed = window.confirm("Ишончингиз комилми?");

    if (!confirmed) return;

    const res = await apiDeleteEmail(+id, user?.id);
    if (res!) {
      toast("Ошибка при удалении");
    } else {
      setEmails((prev) => prev.filter((email) => email.id !== +id));
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.item} onClick={() => setOpen(!open)}>
          <span>Почта</span>
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
                    <th>Active</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email, index) => (
                    <tr key={email.id}>
                      <th>{index + 1}</th>
                      <th>{email.email}</th>
                      <th>
                        {email.is_verified ? (
                          <MdOutlineGppGood />
                        ) : (
                          <MdGppBad />
                        )}
                      </th>
                      <th>
                        <div
                          className={`${styles.items} ${styles.delete}`}
                          onClick={() => deleteEmail(email.id.toString())}
                          style={{ cursor: 'pointer' }}
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
              <div className={styles.addButton} onClick={() => setShowForm(true)}>
                + Добавить почту
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h3 className={styles.modalTitle}>Добавить почту</h3>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Введите email"
          className={styles.input}
        />
        <button onClick={addEmail} className={styles.button}>
          Сохранить
        </button>
      </Modal>
    </>
  );
};

export default EmailSection;
