import React, { useState } from "react";
import style from "./category.module.scss";
import CategoryCard from "../category-card";
import { useCategory } from "../../../hooks/category";
import CategoryCardSkeleton from "../category-card/category-card.skelton";
import PlusImg from "../../../public/img/Plus.svg";
import Image from "next/image";

const DEFAULT_VISIBLE_COUNT = 11;
const LOAD_MORE_COUNT = 6;

const CategorySide = () => {
  const { data: categories, isLoading } = useCategory();
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);

  if (isLoading) {
    return (
      <div className={style.category_card_wrapper}>
        {Array.from({ length: 10 }).map((_, idx) => (
          <CategoryCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className={style.empty_message}>
        <p>Kategoriyalar topilmadi</p>
      </div>
    );
  }

  const handleViewAll = () => {
    setVisibleCount((prev) =>
      Math.min(prev + LOAD_MORE_COUNT, categories.length)
    );
  };

  const isAllShown = visibleCount >= categories.length;

  return (
    <div className={style.category_card_wrapper}>
      {categories.slice(0, visibleCount).map((category: any) => {
        // Safe category rendering
        const safeCategory = {
          id: category?.id || Math.random(),
          name: category?.name || category?.title || 'Kategoriya',
          logo: category?.logo || 'default-logo.png',
          slug: category?.slug || 'category'
        };

        return (
          <CategoryCard key={safeCategory.id} category={safeCategory} />
        );
      })}

      {!isAllShown && (
        <div className={style.view_all} onClick={handleViewAll}>
          <div className={style.view_all_img_wrapper}>
            <Image src={PlusImg} alt="plus_img" />
          </div>
          <p>Barchasini ko'rish</p>
        </div>
      )}
    </div>
  );
};

export default CategorySide;
