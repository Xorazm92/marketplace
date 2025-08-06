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
import { addToCart } from "../../endpoints/cart";
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
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const likedProducts = JSON.parse(localStorage.getItem("favorites") || "[]");
  const token = JSON.parse(localStorage.getItem("accessToken") || "null");

  const [createChatroom] = useMutation<CreateChatroomMutation>(CREATE_CHATROOM);
  const [addUsersToChatroom] = useMutation<AddUsersToChatroomMutation>(ADD_USERS_TO_CHATROOM);
  const [chatroomData, setchatroomData] = useState<any>({});

  const mapBackendToProductData = (backendData: any): ProductData => {
    return {
      id: backendData.id,
      title: backendData.title,
      price: `${parseInt(backendData.price).toLocaleString('uz-UZ')} ${backendData.currency?.symbol || "so'm"}`,
      location: backendData.address?.name || "Manzil ko'rsatilmagan",
      condition: backendData.condition ? "Yangi" : "Ishlatilgan",
      memory: `${backendData.storage} GB / ${backendData.ram} GB RAM`,
      year: backendData.year || "Ko'rsatilmagan",
      color: backendData.color?.name || "Ko'rsatilmagan",
      hasDocuments: backendData.has_document || false,
      publishDate: new Date(backendData.createdAt).toLocaleDateString("uz-UZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      views: backendData.view_count || 0,
      description: backendData.description || "",
      isNegotiable: backendData.negotiable || false,
      images: backendData.product_image?.map(
        (img: any) => `${process.env.NEXT_PUBLIC_BASE_URL}/public/${img.url || img.image}`,
      ) || ["/img/placeholder-product.jpg"],
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

  const handleAddToCart = async () => {
    if (!productData2?.id) {
      toast.error("Mahsulot ma'lumotlari topilmadi");
      return;
    }

    if (!token) {
      toast.error("Savatchaga qo'shish uchun tizimga kiring");
      router.push("/login");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(productData2.id, quantity);
      // Trigger cart count update in header
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!productData2?.id) {
      toast.error("Mahsulot ma'lumotlari topilmadi");
      return;
    }

    if (!token) {
      toast.error("Sotib olish uchun tizimga kiring");
      router.push("/login");
      return;
    }

    // Add to cart first, then redirect to checkout
    setIsAddingToCart(true);
    try {
      await addToCart(productData2.id, quantity);
      // Trigger cart count update in header
      window.dispatchEvent(new Event('storage'));
      router.push("/checkout");
    } catch (error) {
      console.error("Error in buy now:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
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
                <span className={styles.negotiable}>Kelishish mumkin</span>
              )}
            </div>

            <div className={styles.location}>
              <LocationIcon /> {productData.location || "Manzil ko'rsatilmagan"}
            </div>

            <div className={styles.actions}>
              <button
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? "Qo'shilmoqda..." : "🛒 Savatchaga qo'shish"}
              </button>
              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? "Kutilmoqda..." : "⚡ Darhol sotib olish"}
              </button>
              <button className={styles.contactSellerBtn} onClick={handlewriteClick}>
                <MessageIcon /> Sotuvchi bilan bog'lanish
              </button>
            </div>

            <div className={styles.productInfo}>
              <div className={styles.stockStatus}>
                <span className={styles.inStock}>✅ Mavjud</span>
              </div>

              <div className={styles.quantitySelector}>
                <label>Miqdor:</label>
                <div className={styles.quantityControls}>
                  <button onClick={() => handleQuantityChange(quantity - 1)}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => handleQuantityChange(quantity + 1)}>+</button>
                </div>
              </div>

              <div className={styles.productSpecs}>
                <h3>Mahsulot xususiyatlari</h3>
                <ul className={styles.specs}>
                  <li>
                    <span className={styles.label}>Brand</span>
                    <span className={styles.value}>{productData2?.brand?.name || "Ko'rsatilmagan"}</span>
                  </li>
                  <li>
                    <span className={styles.label}>Material</span>
                    <span className={styles.value}>{productData2?.material || "Ko'rsatilmagan"}</span>
                  </li>
                  <li>
                    <span className={styles.label}>Yosh chegarasi</span>
                    <span className={styles.value}>{productData2?.age_range || "Ko'rsatilmagan"}</span>
                  </li>
                  <li>
                    <span className={styles.label}>Rang</span>
                    <span className={styles.value}>
                      <span
                        className={styles.dot}
                        style={{
                          backgroundColor: "#3448f0",
                        }}
                      ></span>{" "}
                      {productData2?.color || "Ko'rsatilmagan"}
                    </span>
                  </li>
                  <li>
                    <span className={styles.label}>Ishlab chiqaruvchi</span>
                    <span className={styles.value}>
                      {productData2?.manufacturer || "Ko'rsatilmagan"}
                    </span>
                  </li>
                  <li>
                    <span className={styles.label}>SKU</span>
                    <span className={styles.value}>{productData2?.sku || `INB-${productData2?.id}`}</span>
                  </li>
                </ul>
              </div>

              <div className={styles.deliveryInfo}>
                <h3>Yetkazib berish</h3>
                <p>🚚 Bepul yetkazib berish (50,000 so'm dan yuqori)</p>
                <p>⏰ 1-3 ish kuni ichida</p>
                <p>📦 Xavfsiz qadoqlash</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <span
            className={activeTab === "description" ? styles.activeTab : ""}
            onClick={() => setActiveTab("description")}
          >
            Tavsif
          </span>
          <span
            className={activeTab === "reviews" ? styles.activeTab : ""}
            onClick={() => setActiveTab("reviews")}
          >
            Sharhlar (0)
          </span>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "description" && (
            <div className={styles.descriptionContent}>
              <h3>Mahsulot haqida</h3>
              <p>{productData.description}</p>

              {productData2?.features && productData2.features.length > 0 && (
                <div className={styles.features}>
                  <h4>Asosiy xususiyatlar:</h4>
                  <ul>
                    {productData2.features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {productData2?.safety_info && (
                <div className={styles.safetyInfo}>
                  <h4>⚠️ Xavfsizlik ma'lumotlari:</h4>
                  <p>{productData2.safety_info}</p>
                </div>
              )}
            </div>
          )}
          {activeTab === "reviews" && (
            <div className={styles.reviewsContent}>
              <h3>Mijozlar sharhlari</h3>
              <div className={styles.noReviews}>
                <p>Hozircha sharhlar yo'q. Birinchi bo'lib sharh qoldiring!</p>
                <button className={styles.writeReviewBtn}>Sharh yozish</button>
              </div>
            </div>
          )}
        </div>

        <h2 className={styles.title}>O'xshash mahsulotlar</h2>
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
