import React, { forwardRef, useEffect, useRef } from "react";
import styles from "./Modal.module.scss";
import { FaRegCircleCheck } from "react-icons/fa6";
import Button from "../../../components/Button/Button";
import { useRouter } from "next/navigation";

interface SuccessCreateModelProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const SuccessCreateModel = forwardRef<HTMLDivElement, SuccessCreateModelProps>(
  ({ isOpen, setIsOpen }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const handleClickOk = () => {
      setIsOpen(false);
      router.push(`/Profile?tab=Объявления`);
    };

    useEffect(() => {
      // Close modal when clicking outside
      const handleClickOutside = (event: MouseEvent) => {
        if (overlayRef.current && event.target === overlayRef.current) {
          setIsOpen(false);
        }
      };

      // Close modal on Escape key press
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [setIsOpen]);

    return (
      <div
        ref={overlayRef}
        className={`${styles.overlay} ${isOpen ? styles.active : ""}`}
        style={{ display: isOpen ? "flex" : "none" }}
      >
        <div
          ref={(node) => {
            modalRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={`${styles.modal} ${isOpen ? styles.active : ""}`}
        >
          <FaRegCircleCheck color="#4AD15F" />
          <p>Ваше объявление успешно создано.</p>
          <Button variant="primary" onClick={handleClickOk}>
            Ok
          </Button>
        </div>
      </div>
    );
  },
);

SuccessCreateModel.displayName = "SuccessCreateModel";

export default SuccessCreateModel;
