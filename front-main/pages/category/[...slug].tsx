import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { CategoryNode } from '../../components/category/CategoryTree';
import Breadcrumbs, { BreadcrumbItem } from '../../components/navigation/Breadcrumbs';
import ProductCard from '../../components/ProductCard';
import categoryService from '../../services/categoryService';
import { CategoryUrlResolver } from '../../utils/categoryUrlResolver';
import styles from './CategoryPage.module.scss';

interface Product {
  id: string;
  title: string;
  price: number;
  images?: string[];
  product_image?: Array<{ url: string }>;
}

interface CategoryPageProps {
  category: CategoryNode;
  products: Product[];
  breadcrumbs: BreadcrumbItem[];
  subcategories: CategoryNode[];
  totalProducts: number;
  allCategories: CategoryNode[];
}

const CategoryPage: NextPage<CategoryPageProps> = ({
  category,
  products,
  breadcrumbs,
  subcategories,
  totalProducts,
  allCategories
}) => {
  const pageTitle = `${category.name} - INBOLA Marketplace`;
  const pageDescription = category.description || `${category.name} kategoriyasidagi mahsulotlar`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>

      <div className={styles.categoryPage}>
        <Breadcrumbs items={breadcrumbs} />

        {/* Category Header */}
        <header className={styles.categoryHeader}>
          <h1>{category.name}</h1>
          {category.description && <p>{category.description}</p>}
          <span>{totalProducts} ta mahsulot</span>
        </header>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <section className={styles.subcategories}>
            <h2>Subkategoriyalar</h2>
            <div className={styles.subcategoriesGrid}>
              {subcategories.map(sub => (
                <Link key={sub.id} href={`/category/${sub.slug || ''}`} className={styles.subcategoryCard}>
                  <h3>{sub.name}</h3>
                  <span>{sub.product_count || 0} mahsulot</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section className={styles.products}>
          <div className={styles.productsGrid}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const slugs = params?.slug as string[];
    if (!slugs || slugs.length === 0) {
      return { notFound: true };
    }

    // Get all categories to build resolver
    const allCategories = await categoryService.getCategoryTree();
    const resolver = new CategoryUrlResolver(allCategories);
    
    // Resolve URL segments to category
    const resolved = resolver.resolveUrl(slugs);
    if (!resolved.isValid) {
      return { notFound: true };
    }

    const { category, breadcrumbs: categoryBreadcrumbs } = resolved;
    
    // Convert to breadcrumb format
    const breadcrumbs: BreadcrumbItem[] = categoryBreadcrumbs.map(cat => ({
      id: cat.id,
      name: cat.name,
      href: resolver.generateUrl(cat.id)
    }));

    // Get subcategories
    const subcategories = resolver.getSubcategories(category.id);
    
    // Mock products for now - in real app, fetch by category
    const products: Product[] = [];
    const totalProducts = 0;
    
    return {
      props: {
        category,
        products,
        breadcrumbs,
        subcategories,
        totalProducts,
        allCategories
      }
    };
  } catch (error) {
    console.error('Category page error:', error);
    return { notFound: true };
  }
};

export default CategoryPage;
