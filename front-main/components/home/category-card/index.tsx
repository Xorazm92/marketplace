import React from "react";
import style from "./category-card.module.scss";
import Image from "next/image";
import { useRouter } from "next/router";

const CategoryCard = (props: any) => {
  const category = props.category || {};
  const { id, name, logo } = category;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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

  // Resolve logo URL safely
  const resolveLogoSrc = (rawLogo: string | undefined) => {
    if (!rawLogo) return '/img/placeholder-category.svg';
    if (rawLogo.startsWith('http')) return rawLogo;
    // If logo points to uploads in backend, avoid double /uploads and prefix API host
    if (rawLogo.startsWith('/uploads') || rawLogo.startsWith('uploads/')) {
      const normalized = rawLogo.replace('/uploads//uploads/', '/uploads/');
      return `${API_URL}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
    }
    // Otherwise serve from Next public folder
    return rawLogo.startsWith('/') ? rawLogo : `/img/${rawLogo}`;
  };

  return (
    <div
      className={style.card_wrapper}
      onClick={() => getProductByCategory(categoryName)}
    >
      <div className={style.img_wrapper}>
        <Image
          src={resolveLogoSrc(categoryLogo)}
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
