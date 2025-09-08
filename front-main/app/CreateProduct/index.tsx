import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { MdOutlineCameraAlt } from "react-icons/md";
import { RootState } from "../../store/store";
import { CreateProductProps, AgeGroup, EducationalCategory, EventType } from "../../types/product";
import { ageGroupAPI } from "../../endpoints/ageGroup";
import { educationalCategoryAPI } from "../../endpoints/educationalCategory";
import { eventTypeAPI } from "../../endpoints/eventType";
import style from "./CreateProduct.module.scss";
import { useCategory, useCurrency } from "../../hooks/category";
import { useGetRegions, useGetRegionById, useUserPhoneNumbers } from "../../hooks/user";
import { AddressData } from "../../types/userData";
import { createProduct } from "../../endpoints/product";

enum SelectType {
  default = "default",
  manual = "manual",
}

interface Brand {
  id: number | string;
  name: string;
}

interface Currency {
  id: number | string;
  name: string;
}

interface Region {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
}

const CreateProduct = () => {
  const router = useRouter();
  const [selectTypeLocation, setSelectTypeLocation] = useState<SelectType>(SelectType.default);
  const [categories, setCategories] = useState<any[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [educationalCategories, setEducationalCategories] = useState<EducationalCategory[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [productData, setProductData] = useState<CreateProductProps>({
    // Basic information
    title: "",
    user_id: Number(user?.id) || 0,
    brand_id: 0,
    price: 0,
    currency_id: 1,
    description: "",
    negotiable: false,
    condition: 'new',
    phone_number: "",
    address_id: 0,
    
    // Categorization
    category_id: 0,
    
    // Child-specific fields
    parental_guidance: false,
    
    // Safety information
    assembly_required: false,
    battery_required: false,
    choking_hazard: false,
    
    // Business information
    availability_status: 'in_stock',
    min_order_quantity: 1,
    
    // Optional fields with defaults
    material: "",
    color: "",
    size: "",
    manufacturer: "",
    safety_info: "",
    features: [],
    weight: 0,
  });

  const [addressData, setAddressData] = useState<AddressData>({
    user_id: Number(user?.id) || 0,
    region_id: null,
    district_id: null,
    name: "",
    lat: null,
    long: null,
    address: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API hooks
  const { data: brands } = useCategory();
  const { data: currency } = useCurrency();
  const { data: phoneNumbers } = useUserPhoneNumbers(Number(user?.id));
  const { data: regions } = useGetRegions();
  const { data: oneRegion } = useGetRegionById(addressData.region_id || 0);

  // Load categories and child-specific data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories using existing hook
        const categoriesData = categories || [];
        setCategories(categoriesData);
        
        // Load age groups
        const ageGroupsData = await ageGroupAPI.getAllAgeGroups();
        setAgeGroups(ageGroupsData);
        
        // Load educational categories
        const educationalCategoriesData = await educationalCategoryAPI.getAllEducationalCategories();
        setEducationalCategories(educationalCategoriesData);
        
        // Load event types
        const eventTypesData = await eventTypeAPI.getAllEventTypes();
        setEventTypes(eventTypesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [categories]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      toast("Tizim sizni xavfsizlik uchun chiqarib qo'ydi. Iltimos, qayta kiring.");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Input sanitization function
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove < and > characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  const handleClickPublishing = async () => {
    try {
      // Input sanitization
      const sanitizedData = {
        ...productData,
        title: sanitizeInput(productData.title),
        description: sanitizeInput(productData.description),
        manufacturer: sanitizeInput(productData.manufacturer || ''),
        color: sanitizeInput(productData.color || ''),
        material: sanitizeInput(productData.material || ''),
        phone_number: productData.phone_number.replace(/[^\d+\-\s()]/g, '') // Only allow phone number characters
      };

      // Basic validation
      if (!sanitizedData.title.trim()) {
        toast("Mahsulot nomini kiriting");
        return;
      } else if (!sanitizedData.brand_id) {
        toast("Brend tanlang");
        return;
      } else if (!sanitizedData.category_id) {
        toast("Kategoriya tanlang");
        return;
      } else if (!images.length) {
        toast("Kamida bitta rasm yuklang");
        return;
      } else if (!sanitizedData.description.trim()) {
        toast("Mahsulot tavsifini kiriting");
        return;
      } else if (!sanitizedData.price || sanitizedData.price <= 0) {
        toast("To'g'ri narx kiriting");
        return;
      } else if (!sanitizedData.phone_number) {
        toast("Telefon raqam kiriting");
        return;
      }

      const response = await createProduct({
        data: sanitizedData,
        images: images,
        addressData: addressData,
      });
      
      if (response) {
        toast.success("Mahsulot muvaffaqiyatli yaratildi!");
        router.push("/");
      }
    } catch (error: any) {
      console.log("Error: ", error);
      toast.error(error.response?.data?.message || "Mahsulot yaratishda xatolik");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prevImages) => [...prevImages, ...filesArray].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={style.create_product_wrapper}>
      <div className={style.container}>
        <h1>Mahsulot qo'shish</h1>

        <form className={style.form} onSubmit={(e) => e.preventDefault()}>
          {/* Product Title */}
          <div className={style.form_section}>
            <label className={style.label}>Mahsulot nomi *</label>
            <input
              type="text"
              className={style.input}
              placeholder="Mahsulot nomini kiriting"
              value={productData.title}
              onChange={(e) =>
                setProductData({ ...productData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Brand Selection */}
          <div className={style.form_section}>
            <label className={style.label}>Brand *</label>
            <select
              className={style.select}
              value={productData.brand_id || ""}
              onChange={(e) => {
                setProductData({
                  ...productData,
                  brand_id: +e.target.value,
                });
              }}
              required
            >
              <option disabled value="">
                Brand tanlang
              </option>
              {brands?.map((brand: Brand) => (
                <option key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div className={style.form_section}>
            <label className={style.label}>Kategoriya *</label>
            <select
              className={style.select}
              value={productData.category_id || ""}
              onChange={(e) =>
                setProductData({
                  ...productData,
                  category_id: +e.target.value,
                })
              }
              required
            >
              <option disabled value="">
                Kategoriya tanlang
              </option>
              {categories?.map((category: any) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Age Range */}
          <div className={style.form_section}>
            <label className={style.label}>Yosh oralig'i</label>
            <select
              className={style.select}
              value={productData.recommended_age_min || ""}
              onChange={(e) =>
                setProductData({ ...productData, recommended_age_min: parseInt(e.target.value) || undefined })
              }
            >
              <option disabled value="">
                Yosh oralig'ini tanlang
              </option>
              <option value="0">0-12 oy</option>
              <option value="12">1-3 yosh</option>
              <option value="36">3-6 yosh</option>
              <option value="72">6-12 yosh</option>
              <option value="144">12+ yosh</option>
            </select>
          </div>

          {/* Material */}
          <div className={style.form_section}>
            <label className={style.label}>Material</label>
            <select
              className={style.select}
              value={productData.material || ""}
              onChange={(e) =>
                setProductData({ ...productData, material: e.target.value })
              }
            >
              <option disabled value="">
                Material tanlang
              </option>
              <option value="plastik">Plastik</option>
              <option value="yog'och">Yog'och</option>
              <option value="mato">Mato</option>
              <option value="metall">Metall</option>
              <option value="qog'oz">Qog'oz</option>
              <option value="rezina">Rezina</option>
              <option value="boshqa">Boshqa</option>
            </select>
          </div>

          {/* Color */}
          <div className={style.form_section}>
            <label className={style.label}>Rang</label>
            <input
              type="text"
              className={style.input}
              placeholder="Rangni kiriting"
              value={productData.color || ""}
              onChange={(e) =>
                setProductData({ ...productData, color: e.target.value })
              }
            />
          </div>

          {/* Size */}
          <div className={style.form_section}>
            <label className={style.label}>O'lcham</label>
            <select
              className={style.select}
              value={productData.size || ""}
              onChange={(e) =>
                setProductData({ ...productData, size: e.target.value })
              }
            >
              <option disabled value="">
                O'lcham tanlang
              </option>
              <option value="kichik">Kichik</option>
              <option value="o'rta">O'rta</option>
              <option value="katta">Katta</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          {/* Manufacturer */}
          <div className={style.form_section}>
            <label className={style.label}>Ishlab chiqaruvchi</label>
            <input
              type="text"
              className={style.input}
              placeholder="Ishlab chiqaruvchi nomini kiriting"
              value={productData.manufacturer || ""}
              onChange={(e) =>
                setProductData({ ...productData, manufacturer: e.target.value })
              }
            />
          </div>

          {/* Price */}
          <div className={style.form_section}>
            <label className={style.label}>Narx *</label>
            <input
              type="number"
              className={style.input}
              placeholder="Narxni kiriting"
              value={productData.price || ""}
              onChange={(e) =>
                setProductData({ ...productData, price: +e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div className={style.form_section}>
            <label className={style.label}>Tavsif *</label>
            <textarea
              className={style.textarea}
              placeholder="Mahsulot haqida batafsil ma'lumot"
              value={productData.description}
              onChange={(e) =>
                setProductData({ ...productData, description: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          {/* Phone Number */}
          <div className={style.form_section}>
            <label className={style.label}>Telefon raqam *</label>
            <input
              type="tel"
              className={style.input}
              placeholder="+998 90 123 45 67"
              value={productData.phone_number}
              onChange={(e) =>
                setProductData({ ...productData, phone_number: e.target.value })
              }
              required
            />
          </div>

          {/* Condition */}
          <div className={style.form_section}>
            <label className={style.label}>Holat *</label>
            <div className={style.radio_group}>
              <label className={style.radio_label}>
                <input
                  type="radio"
                  name="condition"
                  checked={productData.condition === 'new'}
                  onChange={() =>
                    setProductData({ ...productData, condition: 'new' })
                  }
                />
                Yangi
              </label>
              <label className={style.radio_label}>
                <input
                  type="radio"
                  name="condition"
                  checked={productData.condition === 'used'}
                  onChange={() =>
                    setProductData({ ...productData, condition: 'used' })
                  }
                />
                Ishlatilgan
              </label>
              <label className={style.radio_label}>
                <input
                  type="radio"
                  name="condition"
                  checked={productData.condition === 'refurbished'}
                  onChange={() =>
                    setProductData({ ...productData, condition: 'refurbished' })
                  }
                />
                Qayta tiklangan
              </label>
            </div>
          </div>

          {/* Age Group Selection */}
          <div className={style.form_section}>
            <label className={style.label}>Yosh guruhi</label>
            <select
              className={style.select}
              value={productData.age_group_id || ""}
              onChange={(e) =>
                setProductData({ ...productData, age_group_id: parseInt(e.target.value) || undefined })
              }
            >
              <option value="">Yosh guruhini tanlang</option>
              {ageGroups.map((ageGroup) => (
                <option key={ageGroup.id} value={ageGroup.id}>
                  {ageGroup.name} ({Math.floor(ageGroup.min_age_months / 12)}-{Math.floor(ageGroup.max_age_months / 12)} yosh)
                </option>
              ))}
            </select>
          </div>

          {/* Educational Category */}
          <div className={style.form_section}>
            <label className={style.label}>Ta'lim kategoriyasi</label>
            <select
              className={style.select}
              value={productData.educational_category_id || ""}
              onChange={(e) =>
                setProductData({ ...productData, educational_category_id: parseInt(e.target.value) || undefined })
              }
            >
              <option value="">Ta'lim kategoriyasini tanlang</option>
              {educationalCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type */}
          <div className={style.form_section}>
            <label className={style.label}>Tadbir turi</label>
            <select
              className={style.select}
              value={productData.event_type_id || ""}
              onChange={(e) =>
                setProductData({ ...productData, event_type_id: parseInt(e.target.value) || undefined })
              }
            >
              <option value="">Tadbir turini tanlang</option>
              {eventTypes.map((eventType) => (
                <option key={eventType.id} value={eventType.id}>
                  {eventType.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Specific */}
          <div className={style.form_section}>
            <label className={style.label}>Jins uchun</label>
            <select
              className={style.select}
              value={productData.gender_specific || ""}
              onChange={(e) =>
                setProductData({ ...productData, gender_specific: e.target.value as 'Erkak' | 'Ayol' | 'Umumiy' || undefined })
              }
            >
              <option value="">Hammasi uchun</option>
              <option value="Erkak">O'g'il bolalar uchun</option>
              <option value="Ayol">Qiz bolalar uchun</option>
              <option value="Umumiy">Uniseks</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div className={style.form_section}>
            <label className={style.label}>Qiyinchilik darajasi</label>
            <select
              className={style.select}
              value={productData.difficulty_level || ""}
              onChange={(e) =>
                setProductData({ ...productData, difficulty_level: e.target.value as 'Oson' | 'O\'rta' | 'Qiyin' || undefined })
              }
            >
              <option value="">Qiyinchilik darajasini tanlang</option>
              <option value="Oson">Oson</option>
              <option value="O'rta">O'rtacha</option>
              <option value="Qiyin">Qiyin</option>
            </select>
          </div>

          {/* Safety Information */}
          <div className={style.form_section}>
            <label className={style.label}>Xavfsizlik ma'lumotlari</label>
            <textarea
              className={style.textarea}
              value={productData.safety_info || ""}
              onChange={(e) =>
                setProductData({ ...productData, safety_info: e.target.value })
              }
              placeholder="Xavfsizlik bo'yicha muhim ma'lumotlar..."
              rows={3}
            />
          </div>

          {/* Safety Checkboxes */}
          <div className={style.form_section}>
            <label className={style.label}>Xavfsizlik belgilari</label>
            <div className={style.checkbox_group}>
              <label className={style.checkbox_label}>
                <input
                  type="checkbox"
                  checked={productData.parental_guidance}
                  onChange={(e) =>
                    setProductData({ ...productData, parental_guidance: e.target.checked })
                  }
                />
                Ota-ona nazorati talab qilinadi
              </label>
              <label className={style.checkbox_label}>
                <input
                  type="checkbox"
                  checked={productData.assembly_required}
                  onChange={(e) =>
                    setProductData({ ...productData, assembly_required: e.target.checked })
                  }
                />
                Yig'ish talab qilinadi
              </label>
              <label className={style.checkbox_label}>
                <input
                  type="checkbox"
                  checked={productData.battery_required}
                  onChange={(e) =>
                    setProductData({ ...productData, battery_required: e.target.checked })
                  }
                />
                Batareya talab qilinadi
              </label>
              <label className={style.checkbox_label}>
                <input
                  type="checkbox"
                  checked={productData.choking_hazard}
                  onChange={(e) =>
                    setProductData({ ...productData, choking_hazard: e.target.checked })
                  }
                />
                Bo'g'ilish xavfi mavjud
              </label>
            </div>
          </div>

          {/* Educational Value */}
          <div className={style.form_section}>
            <label className={style.label}>Ta'limiy qiymati</label>
            <textarea
              className={style.textarea}
              value={productData.educational_value || ""}
              onChange={(e) =>
                setProductData({ ...productData, educational_value: e.target.value })
              }
              placeholder="Bu mahsulot qanday ta'limiy qiymatga ega..."
              rows={3}
            />
          </div>

          {/* Play Time */}
          <div className={style.form_section}>
            <label className={style.label}>O'yin vaqti</label>
            <input
              type="text"
              className={style.input}
              value={productData.play_time || ""}
              onChange={(e) =>
                setProductData({ ...productData, play_time: e.target.value })
              }
              placeholder="Masalan: 30-60 daqiqa"
            />
          </div>

          {/* Player Count */}
          <div className={style.form_section}>
            <label className={style.label}>O'yinchilar soni</label>
            <input
              type="text"
              className={style.input}
              value={productData.player_count || ""}
              onChange={(e) =>
                setProductData({ ...productData, player_count: e.target.value })
              }
              placeholder="Masalan: 2-4 kishi"
            />
          </div>

          {/* Negotiable */}
          <div className={style.form_section}>
            <label className={style.checkbox_label}>
              <input
                type="checkbox"
                checked={productData.negotiable}
                onChange={(e) =>
                  setProductData({ ...productData, negotiable: e.target.checked })
                }
              />
              Narx kelishish mumkin
            </label>
          </div>

          {/* Images */}
          <div className={style.form_section}>
            <label className={style.label}>Rasmlar *</label>
            <div className={style.image_upload}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                multiple
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className={style.upload_button}
                onClick={triggerFileInput}
              >
                <MdOutlineCameraAlt size={24} />
                Rasm yuklash
              </button>

              {images.length > 0 && (
                <div className={style.image_preview}>
                  {images.map((image, index) => (
                    <div key={index} className={style.image_item}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className={style.preview_image}
                      />
                      <button
                        type="button"
                        className={style.remove_button}
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className={style.form_section}>
            <button
              type="button"
              className={style.submit_button}
              onClick={handleClickPublishing}
            >
              Mahsulot qo'shish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
