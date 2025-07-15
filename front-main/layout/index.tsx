import React, { FC } from "react";
import style from "./layout.module.scss";
import MarketplaceHeader from "../components/marketplace/Header";
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: FC<MainLayoutProps> = (props) => {
  return (
    <div className={style.layout_wrapper}>
      <div>
        <MarketplaceHeader />
        {props.children}
      </div>
    </div>
  );
};

export default MainLayout;
