"use client"
import { FaChevronDown, FaRegUser } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { MdOutlineLogout } from "react-icons/md";
import { useRouter } from "next/navigation"
import { useState } from "react"
import styles from "./dropdown.module.scss"

export default function DropDown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("persist:root")
    localStorage.removeItem("user-store")
    router.push("/login")
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const closeDropdown = () => {
    setIsOpen(false)
  }

  return (
    <div className={styles.dropdown}>
      <button
        className={styles.trigger}
        onClick={toggleDropdown}
        onBlur={() => setTimeout(closeDropdown, 150)}
      >
        <FaRegUser size={18} />
        <span>Profil</span>
        <FaChevronDown size={12} />
      </button>

      {isOpen && (
        <div className={styles.content}>
          <div className={styles.menuItem} onClick={() => {
            router.push("/Profile?tab=Объявления")
            closeDropdown()
          }}>
            <FaRegUser className={styles.icon} />
            <span>Profil</span>
          </div>
          
          <div className={styles.menuItem} onClick={() => {
            router.push("/Profile?tab=Настройки")
            closeDropdown()
          }}>
            <IoSettingsSharp className={styles.icon} />
            <span>Sozlamalar</span>
          </div>

          <div className={styles.separator}></div>

          <div className={styles.menuItem} onClick={handleLogout}>
            <MdOutlineLogout className={styles.icon} />
            <span>Chiqish</span>
          </div>
        </div>
      )}
    </div>
  )
}