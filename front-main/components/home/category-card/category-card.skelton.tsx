import React from "react";
import style from "./category-card.module.scss";

const CategoryCardSkeleton = () => {
  return (
    <div className={`${style.card_wrapper} ${style.skeleton_card}`}>
      <div className={style.img_wrapper}>
        <div className={style.skeleton_box} />
      </div>
      <div className={style.card_title}>
        <div className={style.skeleton_text} />
      </div>
    </div>
  );
};

export default CategoryCardSkeleton;
