import React, { FC } from "react";
import style from "./layout.module.scss";
import Navbar from "./Header/Navbar";
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: FC<MainLayoutProps> = (props) => {
  return (
    <div className={style.layout_wrapper}>
      <div>
        <Navbar />
        {props.children}
      </div>
    </div>
  );
};

export default MainLayout;
