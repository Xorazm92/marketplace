import React, { useEffect, useState } from "react";
import styles from "./Settings.module.scss";
import PhoneSection from "./components/PhoneSection/PhoneSection";
import EmailSection from "./components/EmailSection/EmailSection";
import AddressSection from "./components/AddressSection/AddressSection";
import LanguageSelector from "./components/LanguageSelector/LanguageSelector";
import { IoExitOutline } from "react-icons/io5";
import { RiDeleteBin5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { jwtDecode } from "jwt-decode";
import { sign_OutUser } from "../../endpoints";

const Settings: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      if (!token || !isAuthenticated) {
        toast.info(
          "Tizim sizni xavfsizlik uchun chiqarib qo'ydi. Iltimos, qayta kiring.",
        );
        router.replace("/login");
        return;
      }

      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          toast.info(
            "Tizim sizni xavfsizlik uchun chiqarib qo'ydi. Iltimos, qayta kiring.",
          );
          router.replace("/login");
          return;
        }
      } catch (error) {
        toast.info(
          "Tizim sizni xavfsizlik uchun chiqarib qo'ydi. Iltimos, qayta kiring.",
        );

        router.replace("/login");
        return;
      }

      setLoading(false); // faqat hamma tekshiruvdan o'tgandan keyin yuklash tugaydi
    };

    checkAuth();
  }, [isAuthenticated, router]);

  const handleExit = async (id: number | undefined) => {
    const confirmed = window.confirm('Ишончингиз комилми?');
    if (!confirmed) return;
    if (!id) {
      toast.error("User ID not found");
      return;
    }

    const result = await sign_OutUser(id);

    if (result) {
      toast.success("Successfully signed out");
      router.push("/login");
    } else {
      toast.error("Failed to sign out");
    }
  };

  // 🔒 Auth tekshiruvi tugamaguncha hech narsa ko‘rsatmaymiz
  if (loading) return null; // yoki <div>Loading...</div> ko‘rsatsa ham bo‘ladi

  return (
    <div className={styles.container}>
      <div className={styles.sections}>
        <PhoneSection />
        <EmailSection />
        <AddressSection />
      </div>

      <div className={styles.item} onClick={() => handleExit(user?.id)}>
        <span>
          <IoExitOutline /> Выйти с аккаунта
        </span>
      </div>

      <div
        className={`${styles.item} ${styles.delete}`}
        onClick={() => toast("O'chirishning hozir iloji yo'q")}
      >
        <span>
          <RiDeleteBin5Line /> Удалить учетную запись
        </span>
      </div>
    </div>
  );
};

export default Settings;

// import React, { useEffect, useState } from 'react';
// import styles from './Settings.module.scss';
// import { GrLanguage } from 'react-icons/gr';
// import { IoExitOutline } from 'react-icons/io5';
// import { RiCheckboxBlankCircleFill, RiDeleteBin5Line } from 'react-icons/ri';
// import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
// import { toast } from 'react-toastify';

// const LANGUAGES = ['Русский', 'O‘zbek', 'English'];

// const Settings: React.FC = () => {
//   const [phoneOpen, setPhoneOpen] = useState(false);
//   const [emailOpen, setEmailOpen] = useState(false);
//   const [addressOpen, setAddressOpen] = useState(false);
//   const [languageOpen, setLanguageOpen] = useState(false);

//   const [phones, setPhones] = useState<string[]>([]);
//   const [emails, setEmails] = useState<string[]>([]);
//   const [addresses, setAddresses] = useState<string[]>([]);
//   const [activeNumber, setActiveNumber] = useState(0);

//   // ---------------- LOAD FROM LOCAL STORAGE ----------------
//   useEffect(() => {
//     setPhones(JSON.parse(localStorage.getItem('phones') || '[]'));
//     setEmails(JSON.parse(localStorage.getItem('emails') || '[]'));
//     setAddresses(JSON.parse(localStorage.getItem('addresses') || '[]'));
//     setActiveNumber(Number(localStorage.getItem('language')) || 0);
//   }, []);

//   // ---------------- SAVE TO LOCAL STORAGE ----------------
//   useEffect(() => {
//     localStorage.setItem('phones', JSON.stringify(phones));
//   }, [phones]);

//   useEffect(() => {
//     localStorage.setItem('emails', JSON.stringify(emails));
//   }, [emails]);

//   useEffect(() => {
//     localStorage.setItem('addresses', JSON.stringify(addresses));
//   }, [addresses]);

//   useEffect(() => {
//     localStorage.setItem('language', String(activeNumber));
//   }, [activeNumber]);

//   // ---------------- HANDLERS ----------------
//   const handleDelete = (
//     index: number,
//     data: string[],
//     setData: React.Dispatch<React.SetStateAction<string[]>>,
//   ) => {
//     const updated = data.filter((_, i) => i !== index);
//     setData(updated);
//   };

//   const handleAdd = (
//     promptText: string,
//     data: string[],
//     setData: React.Dispatch<React.SetStateAction<string[]>>,
//   ) => {
//     const value = prompt(promptText);
//     if (value) {
//       setData([...data, value]);
//     }
//   };

//   const [showPhoneForm, setShowPhoneForm] = useState(false);
//   const [newPhone, setNewPhone] = useState('');
//   const [showEmailForm, setShowEmailForm] = useState(false);
//   const [newEmail, setNewEmail] = useState('');

//   const [showAddressForm, setShowAddressForm] = useState(false);
//   const [newAddress, setNewAddress] = useState('');

//   return (
//     <div className={styles.container}>
//       {/* Phones */}
//       <div className={styles.item} onClick={() => setPhoneOpen(!phoneOpen)}>
//         <span>Номер телефона</span>
//         <span className={styles.arrow}>
//           {phoneOpen ? <FaChevronUp /> : <FaChevronDown />}
//         </span>
//       </div>
//       {phoneOpen && (
//         <div className={styles.subsection}>
//           {phones.map((phone, i) => (
//             <div className={styles.subItem} key={i}>
//               <div>{phone}</div>
//               <div
//                 className={`${styles.item} ${styles.delete}`}
//                 onClick={() => handleDelete(i, phones, setPhones)}
//               >
//                 <RiDeleteBin5Line />
//               </div>
//             </div>
//           ))}

//           {showPhoneForm ? (
//             <div className={styles.formRow}>
//               <input
//                 type="text"
//                 value={newPhone}
//                 onChange={(e) => setNewPhone(e.target.value)}
//                 placeholder="Yangi telefon raqami"
//                 className={styles.input}
//               />
//               <button
//                 onClick={() => {
//                   if (newPhone.trim()) {
//                     setPhones([...phones, newPhone.trim()]);
//                     setNewPhone('');
//                     setShowPhoneForm(false);
//                   }
//                 }}
//                 className={styles.button}
//               >
//                 Qo‘shish
//               </button>
//               <button
//                 onClick={() => {
//                   setNewPhone('');
//                   setShowPhoneForm(false);
//                 }}
//                 className={styles.cancel}
//               >
//                 Bekor qilish
//               </button>
//             </div>
//           ) : (
//             <div
//               className={styles.addButton}
//               onClick={() => setShowPhoneForm(true)}
//             >
//               + Добавить номер телефона
//             </div>
//           )}
//         </div>
//       )}

//       {/* Emails */}
//       <div className={styles.item} onClick={() => setEmailOpen(!emailOpen)}>
//         <span>Почта</span>
//         <span className={styles.arrow}>
//           {emailOpen ? <FaChevronUp /> : <FaChevronDown />}
//         </span>
//       </div>
//       {emailOpen && (
//         <div className={styles.subsection}>
//           {emails.map((email, i) => (
//             <div className={styles.subItem} key={i}>
//               <div>{email}</div>
//               <div
//                 className={`${styles.item} ${styles.delete}`}
//                 onClick={() => handleDelete(i, emails, setEmails)}
//               >
//                 <RiDeleteBin5Line />
//               </div>
//             </div>
//           ))}

//           {showEmailForm ? (
//             <div className={styles.formRow}>
//               <input
//                 type="email"
//                 value={newEmail}
//                 onChange={(e) => setNewEmail(e.target.value)}
//                 placeholder="Yangi pochta"
//                 className={styles.input}
//               />
//               <button
//                 onClick={() => {
//                   if (newEmail.trim()) {
//                     setEmails([...emails, newEmail.trim()]);
//                     setNewEmail('');
//                     setShowEmailForm(false);
//                   }
//                 }}
//                 className={styles.button}
//               >
//                 Qo‘shish
//               </button>
//               <button
//                 onClick={() => {
//                   setNewEmail('');
//                   setShowEmailForm(false);
//                 }}
//                 className={styles.cancel}
//               >
//                 Bekor qilish
//               </button>
//             </div>
//           ) : (
//             <div
//               className={styles.addButton}
//               onClick={() => setShowEmailForm(true)}
//             >
//               + Добавить почту
//             </div>
//           )}
//         </div>
//       )}

//       {/* Addresses */}
//       <div className={styles.item} onClick={() => setAddressOpen(!addressOpen)}>
//         <span>Адрес</span>
//         <span className={styles.arrow}>
//           {addressOpen ? <FaChevronUp /> : <FaChevronDown />}
//         </span>
//       </div>
//       {addressOpen && (
//         <div className={styles.subsection}>
//           {addresses.map((address, i) => (
//             <div className={styles.subItem} key={i}>
//               <div>{address}</div>
//               <div
//                 className={`${styles.item} ${styles.delete}`}
//                 onClick={() => handleDelete(i, addresses, setAddresses)}
//               >
//                 <RiDeleteBin5Line />
//               </div>
//             </div>
//           ))}

//           {showAddressForm ? (
//             <div className={styles.formRow}>
//               <input
//                 type="text"
//                 value={newAddress}
//                 onChange={(e) => setNewAddress(e.target.value)}
//                 placeholder="Yangi manzil"
//                 className={styles.input}
//               />
//               <button
//                 onClick={() => {
//                   if (newAddress.trim()) {
//                     setAddresses([...addresses, newAddress.trim()]);
//                     setNewAddress('');
//                     setShowAddressForm(false);
//                   }
//                 }}
//                 className={styles.button}
//               >
//                 Qo‘shish
//               </button>
//               <button
//                 onClick={() => {
//                   setNewAddress('');
//                   setShowAddressForm(false);
//                 }}
//                 className={styles.cancel}
//               >
//                 Bekor qilish
//               </button>
//             </div>
//           ) : (
//             <div
//               className={styles.addButton}
//               onClick={() => setShowAddressForm(true)}
//             >
//               + Добавить адрес
//             </div>
//           )}
//         </div>
//       )}

//       {/* Language */}
//       <div
//         className={styles.item}
//         onClick={() => setLanguageOpen(!languageOpen)}
//       >
//         <span>
//           <GrLanguage /> Язык приложения
//         </span>
//         <span className={styles.language}>{LANGUAGES[activeNumber]}</span>
//       </div>
//       {languageOpen && (
//         <div className={styles.subsection}>
//           {LANGUAGES.map((language, i) => (
//             <div
//               className={styles.subItem}
//               key={i}
//               onClick={() => setActiveNumber(i)}
//             >
//               <span style={{ color: activeNumber === i ? '#000' : '#ccc' }}>
//                 <RiCheckboxBlankCircleFill />
//               </span>
//               <span>{language}</span>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Logout */}
//       <div
//         className={styles.item}
//         onClick={() => toast("Logout qilinmoqchi lekin hozir iloji yo'q")}
//       >
//         <span>
//           <IoExitOutline /> Выйти с аккаунта
//         </span>
//       </div>

//       {/* Delete Account */}
//       <div
//         className={`${styles.item} ${styles.delete}`}
//         onClick={() => toast("O'chirishning hozir iloji yo'q")}
//       >
//         <span>
//           <RiDeleteBin5Line /> Удалить учетную запись
//         </span>
//       </div>
//     </div>
//   );
// };

// export default Settings;
