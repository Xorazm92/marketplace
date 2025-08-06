import React from "react";
import style from "./category-card.module.scss";
import Image from "next/image";
import { useRouter } from "next/router";

const CategoryCard = (props: any) => {
  const category = props.category || {};
  const { id, name, logo } = category;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  // Safe category name extraction
  const categoryName = typeof category === 'object' ?
    (category.name || category.title || 'Kategoriya') :
    String(category);
  const categoryLogo = typeof category === 'object' ?
    (category.logo || 'default-logo.png') :
    'default-logo.png';

  const getProductByCategory = (name: string) => {
    const newQuery = router.query;
    newQuery.brand = name;

    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  return (
    <div
      className={style.card_wrapper}
      onClick={() => getProductByCategory(categoryName)}
    >
      <div className={style.img_wrapper}>
        <Image
          src={`${BASE_URL}/uploads/${categoryLogo}`}
          alt={categoryName}
          width={80}
          height={80}
        />
      </div>
      <div className={style.card_title}>
        <p>{categoryName}</p>
      </div>
    </div>
  );
};

export default CategoryCard;
