import { useState, useEffect } from "react";
import styles from "./Edit.module.scss";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import {
  EditIcon,
  LeftNavIcon,
  LocationIcon,
  RightNavIcon,
  TopIcon,
} from "@/public/icons/profile";
import { useRouter } from "next/router";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useProductById } from "@/hooks/products.use";
import { useFavorites } from "@/hooks/useFavorites";

interface ProductData {
  id: number;
  title: string;
  price: string;
  location: string;
  condition: string;
  memory: string;
  year: string;
  color: string;
  hasDocuments: boolean;
  publishDate: string;
  views: number;
  description: string;
  isNegotiable: boolean;
  images: string[];
}

const Product = () => {
  const router = useRouter();
  const id = router.query.id;
  const likedProducts = JSON.parse(localStorage.getItem("favorites") || "[]");
  const { data: productData2, isLoading } = useProductById(Number(id));

  const [productData, setProductData] = useState<ProductData | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description",
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();

  const mapBackendToProductData = (backendData: any): ProductData => {
    return {
      id: backendData.id,
      title: backendData.title,
      price: backendData.price + " " + (backendData.currency?.name || "USD"),
      location: backendData.address?.name || "Неизвестно",
      condition: backendData.condition ? "Новый" : "Б/у",
      memory: `${backendData.storage} GB / ${backendData.ram} GB RAM`,
      year: backendData.year || "Не указан",
      color: backendData.color?.name || "Неизвестно",
      hasDocuments: backendData.has_document || false,
      publishDate: new Date(backendData.createdAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      views: backendData.view_count || 0,
      description: backendData.description || "",
      isNegotiable: backendData.negotiable || false,
      images: backendData.product_image?.map(
        (img: any) => `http://localhost:3001${img.url}`,
      ) || ["mobile_phone_image.jpg"],
    };
  };

  useEffect(() => {
    if (productData2) {
      setProductData(mapBackendToProductData(productData2));
      setCurrentImageIndex(0);
    }
  }, [productData2]);

  if (isLoading || !productData) {
    return null;
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? productData.images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === productData.images.length - 1 ? 0 : prev + 1,
    );
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleFavoriteToggle = () => {
    toggleFavorite(productData.id);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = () => {
    setIsEditModalOpen(false);
    router.push(`/Profile/Edit/${productData.id}`);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const handlePromote = async () => {
    try {
      const response = await fetch(`/api/product/${productData.id}/promote`, {
        method: "POST",
      });
      if (response.ok) {
        alert("Объявление поднято!");
      }
    } catch (error) {
      console.error("Error promoting product:", error);
    }
  };

  return (
    <>
      <div className={styles.detailsPage}>
        <div className={styles.breadcrumbs}>
          <Breadcrumb />
        </div>

        <div className={styles.container}>
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <Image
                src={
                  productData.images[currentImageIndex] ||
                  "mobile_phone_image.jpg"
                }
                alt={productData.title}
                width={500}
                height={500}
                className={styles.mainImg}
              />
              <div className={styles.imageControls}>
                <button className={styles.navButton} onClick={handlePrevImage}>
                  <LeftNavIcon />
                </button>
                <button className={styles.navButton} onClick={handleNextImage}>
                  <RightNavIcon />
                </button>
              </div>
              <div className={styles.indicators}>
                {productData.images.map((_, index) => (
                  <span
                    key={index}
                    className={index === currentImageIndex ? styles.active : ""}
                    onClick={() => handleImageSelect(index)}
                  />
                ))}
              </div>
            </div>
            <div className={styles.thumbnails}>
              {productData.images.slice(1, 4).map((image, index) => (
                <Image
                  key={index}
                  src={image || "mobile_phone_image.jpg"}
                  alt={`${productData.title} ${index + 1}`}
                  width={100}
                  height={100}
                  className={styles.thumbnail}
                  onClick={() => handleImageSelect(index + 1)}
                />
              ))}
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.header}>
              <h1>{productData.title}</h1>
              <button
                className={`${styles.favoriteBtn} ${
                  isFavorite(productData.id) ? styles.favorited : ""
                }`}
                onClick={handleFavoriteToggle}
              >
                <div className={styles.like}>
                  {likedProducts.includes(Number(id)) ? (
                    <FaHeart color="#FF4E64" />
                  ) : (
                    <FaRegHeart color="#999CA0" />
                  )}
                </div>
              </button>
            </div>

            <div className={styles.price}>
              {productData.price}
              {productData.isNegotiable && (
                <span className={styles.negotiable}>Торг есть</span>
              )}
            </div>

            <div className={styles.location}>
              <LocationIcon /> {productData.location}
            </div>

            <div className={styles.actions}>
              <button className={styles.edit} onClick={handleEditClick}>
                <EditIcon /> Изменить
              </button>
              <button className={styles.promote} onClick={handlePromote}>
                <TopIcon /> Поднять
              </button>
            </div>

            <ul className={styles.specs}>
              <li>
                <span className={styles.label}>Состояние</span>
                <span className={`${styles.value} ${styles.valueOne}`}>
                  {productData.condition}
                </span>
              </li>
              <li>
                <span className={styles.label}>Память</span>
                <span className={styles.value}>{productData.memory}</span>
              </li>
              <li>
                <span className={styles.label}>Год выпуска</span>
                <span className={styles.value}>{productData.year}</span>
              </li>
              <li>
                <span className={styles.label}>Цвет</span>
                <span className={styles.value}>
                  <span
                    className={styles.dot}
                    style={{
                      backgroundColor: `${
                        productData2.color.code || productData2.color.name
                      }`,
                    }}
                  ></span>{" "}
                  {productData.color}
                </span>
              </li>
              <li>
                <span className={styles.label}>Коробка с документами</span>
                <span className={styles.value}>
                  {productData.hasDocuments ? "Есть" : "Нет"}
                </span>
              </li>
              <li>
                <span className={styles.label}>Размещено</span>
                <span className={styles.value}>{productData.publishDate}</span>
              </li>
              <li>
                <span className={styles.label}>Просмотров</span>
                <span className={styles.value}>{productData.views}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.tabs}>
          <span
            className={activeTab === "description" ? styles.activeTab : ""}
            onClick={() => setActiveTab("description")}
          >
            Описание
          </span>
          <span
            className={activeTab === "reviews" ? styles.activeTab : ""}
            onClick={() => setActiveTab("reviews")}
          >
            Отзывы (0)
          </span>
        </div>

        <div className={styles.description}>
          {activeTab === "description" && <p>{productData.description}</p>}
          {activeTab === "reviews" && (
            <p>Отзывы пользователей будут отображаться здесь.</p>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>Вы действительно хотите изменить это объявление?</p>
            <div className={styles.modalButtons}>
              <button onClick={handleEditConfirm}>Да</button>
              <button onClick={handleEditCancel}>Нет</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Product;
