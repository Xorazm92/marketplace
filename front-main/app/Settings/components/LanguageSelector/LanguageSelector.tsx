import React, { useState, useEffect } from "react";
import { GrLanguage } from "react-icons/gr";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { RiCheckboxBlankCircleFill } from "react-icons/ri";
import styles from "./LanguageSelector.module.scss";
import { getFromStorage, setToStorage } from "../../../../utils/local-storege";

const languages = ["Русский", "O‘zbek", "English"];

const LanguageSelector = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const saved = getFromStorage("language")[0] || [];

    if (saved) {
      const index = languages.indexOf(saved);
      if (index !== -1) setSelected(index);
    }
  }, []);

  const changeLang = (index: number) => {
    setSelected(index);
    setToStorage("language", [languages[index]]);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.item} onClick={() => setOpen(!open)}>
          <span>
            <GrLanguage /> Язык приложения
          </span>
          <span className={styles.language}>{languages[selected]}</span>
        </div>
        {open && (
          <div className={styles.subsection}>
            {languages.map((lang, i) => (
              <div
                className={styles.subItem}
                key={i}
                onClick={() => changeLang(i)}
              >
                <span style={{ color: i === selected ? "#000" : "#ccc" }}>
                  <RiCheckboxBlankCircleFill />
                </span>
                <span>{lang}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default LanguageSelector;
