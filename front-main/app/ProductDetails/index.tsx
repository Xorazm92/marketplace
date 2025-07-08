import { useState, useEffect } from "react";
import styles from "./ProductDetails.module.scss";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import {
  LeftNavIcon,
  LocationIcon,
  MessageIcon,
  PhoneIcon,
  RightNavIcon,
} from "@/public/icons/profile";
import { useProductById } from "../../hooks/products.use";
import { useRouter } from "next/router";
import { useFavorites } from "../../hooks/useFavorites";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Link from "next/link";
import ProductCard from "@/components/home/product-card";
import { getAllProducts } from "@/endpoints";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { CREATE_CHATROOM } from "@/app/Chat/src/graphql/mutations/CreateChatroom";
import { ADD_USERS_TO_CHATROOM } from "@/app/Chat/src/graphql/mutations/AddUsersToChatroom";
import {
  AddUsersToChatroomMutation,
  Chatroom,
  CreateChatroomMutation,
} from "@/app/Chat/src/gql/graphql";


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
  userId?: number;
}

const ProductDetails = () => {
  const router = useRouter();
  const id = Number(router.query.id);
  const { data: productData2, isLoading } = useProductById(Number(id));
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description",
  );
  const { toggleFavorite, isFavorite } = useFavorites();
  const [productsList, setProductsList] = useState<any[]>([]); // 🔥

  const likedProducts = JSON.parse(localStorage.getItem("favorites") || "[]");
  const token = JSON.parse(localStorage.getItem("accessToken") || "null");

  const [createChatroom] = useMutation<CreateChatroomMutation>(CREATE_CHATROOM);
  const [addUsersToChatroom] = useMutation<AddUsersToChatroomMutation>(ADD_USERS_TO_CHATROOM);
  const [chatroomData, setchatroomData] = useState<any>({});

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
        (img: any) => `${process.env.NEXT_PUBLIC_BASE_URL}/${img.url}`,
      ) || ["/placeholder.svg"],
      userId: backendData.user_id,
    };
  };

  useEffect(() => {
    if (productData2) {
      const mapped = mapBackendToProductData(productData2);
      setProductData(mapped);
      setCurrentImageIndex(0);
      setchatroomData(productData2)
      setPhoneNumber(productData2.phone_number);
    }
  }, [productData2]);

  useEffect(() => {
    getAllProducts()
      .then((products) => {
        if (products) {
          setProductsList(products);
        }
      })
      .catch((error) => {
        toast.error("Failed to fetch products");
      });
  }, []);

  if (isLoading || !productData) return null;

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

  const handlewriteClick = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      if (chatroomData?.user) {
        const chatroomName = `${chatroomData.user?.id}` || "Chat";
        const createChatroomResult = await createChatroom({
          variables: {
            name: chatroomName,
            userId: parseInt(chatroomData.user?.id)
          },
          onCompleted: (data) => {
          },
        })
        const chatroomId = parseInt(createChatroomResult.data?.createChatroom?.id || "0");
        if (chatroomId) {
          router.push({
            pathname: "/Profile",
            query: { tab: "Сообщения", chatroom: chatroomId },
          });
        }
        else {
          if (!chatroomData.user?.id) throw new Error("User IDs missing");
          await addUsersToChatroom({
            variables: {
              chatroomId: chatroomId,
              userIds: [chatroomData.user?.id],
            },
            onCompleted: () => {
              router.push({
                pathname: "/Profile",
                query: { tab: "Сообщения", chatroom: chatroomId },
              });
            },
          })
        }

      }

    } catch (err) {
      toast.error("Не удалось создать чат");
      console.error(err);
    }
  };


  const handlePhone = async () => {
    setShowPhone(true);
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
                  productData.images[currentImageIndex] || "/placeholder.svg"
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
                  src={image || "/placeholder.svg"}
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
                className={`${styles.favoriteBtn} ${isFavorite(productData.id) ? styles.favorited : ""
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
              <button className={styles.write} onClick={handlewriteClick}>
                <MessageIcon /> Написать
              </button>
              <button className={styles.phone} onClick={handlePhone}>
                <PhoneIcon />
                {showPhone
                  ? phoneNumber || "Номер недоступен"
                  : "Показать номер"}
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
                      backgroundColor: `${productData2.color.code || productData2.color.name
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
          <div>
            <div></div>
          </div>
          {activeTab === "description" && <p>{productData.description}</p>}
          {activeTab === "reviews" && (
            <p>Отзывы пользователей будут отображаться здесь.</p>
          )}
        </div>

        <h2 className={styles.title}>Вам может понравиться</h2>
        <div className={styles.cardGrid}>
          {productsList
            .filter((p) => p.id !== productData?.id)
            .map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={likedProducts.includes(product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
