import React from "react";
import style from "./Button.module.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  customColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  customColor,
  className = "",
  ...props
}) => {
  const buttonStyle = customColor
    ? { backgroundColor: customColor }
    : undefined;

  return (
    <button
      {...props}
      className={`${style.button} ${style[variant]} ${className}`}
      style={buttonStyle}
    >
      {children}
    </button>
  );
};

export default Button;
