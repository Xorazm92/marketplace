"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import style from "../../../app/CreateProduct/CreateProduct.module.scss"
import { MdOutlineCameraAlt } from "react-icons/md"
import { useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import type { CreateProductProps } from "@/types"
import { jwtDecode } from "jwt-decode"
import { toast } from "react-toastify"
import { useCategory, useCategoryById, useColors, useCurrency } from "@/hooks/category"
import { useGetRegionById, useGetRegions, useUserPhoneNumbers } from "@/hooks/user"
import type { AddressData } from "@/types/userData"
import { IoMdCheckmarkCircleOutline } from "react-icons/io"
import { useProductById } from "@/hooks/products.use"
import type { RootState } from "../../../store/store"
import MapComponent from "../../../app/CreateProduct/components/MapComponent"
import SuccessCreateModel from "../../../app/CreateProduct/components/SuccessCreateModel"
import { useAddProductImage, useEditProduct } from "@/hooks/products.use"
import { AiOutlineLoading3Quarters, AiOutlineDelete } from "react-icons/ai"
import { deleteProductImage } from "@/endpoints/product"

enum SelectType {
  default = "default",
  manual = "manual",
}

interface Color {
  id: number | string
  name: string
  code?: string
}

interface Model {
  id: number | string
  name: string
  brand_id: number | string
}

interface Brand {
  id: number | string
  name: string
  model: Model[]
}

interface Currency {
  id: number | string
  name: string
}

interface Region {
  id: number
  name: string
}

interface District {
  id: number
  name: string
}

const EditProduct = () => {
  // Router and params
  const router = useRouter()
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  // All state declarations
  const [selectType, setSelectType] = useState<SelectType>(SelectType.default)
  const [selectTypeLocation, setSelectTypeLocation] = useState<SelectType>(SelectType.default)
  const [createModal, setCreateModal] = useState<boolean>(false)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Form state
  const [productData, setProductData] = useState<CreateProductProps>({
    title: "",
    brand_id: 0,
    model_id: 0,
    year: "",
    price: 0,
    currency_id: 1,
    description: "",
    negotiable: false,
    phone_number: "",
    user_id: Number(user?.id) || 0,
    address_id: 0,
    color_id: 0,
    has_document: false,
    ram: 0,
    storage: 0,
    other_model: "",
    condition: false,
  })

  const [addressData, setAddressData] = useState<AddressData>({
    user_id: Number(user?.id) || 0,
    region_id: null,
    district_id: null,
    name: "",
    lat: null,
    long: null,
    address: "",
  })

  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ALL API hooks called unconditionally
  const { data: productData2, isLoading, error } = useProductById(Number(id))
  const { data: brands } = useCategory()
  const { data: oneBrand } = useCategoryById(Number(productData.brand_id) || 0)
  const { data: colors } = useColors()
  const { data: currency } = useCurrency()
  const { data: phoneNumbers } = useUserPhoneNumbers(Number(user?.id) || 0)
  const { data: regions } = useGetRegions()
  const { data: oneRegion } = useGetRegionById(addressData.region_id || 0)
  const { mutate: addImage } = useAddProductImage()
  const { mutate: editProduct } = useEditProduct()

  // ALL useEffect hooks called unconditionally
  useEffect(() => {
    if (!id) {
      console.error("Product ID is missing")
      router.push("/Profile")
    }
  }, [id, router])

  useEffect(() => {
    if (productData2 && !isLoading) {
      setProductData({
        title: productData2.title || "",
        brand_id: productData2.brand?.id || 0,
        model_id: productData2.model_id || 0,
        year: productData2.year?.toString() || "",
        price: productData2.price || 0,
        currency_id: productData2.currency?.id || 1,
        description: productData2.description || "",
        negotiable: productData2.negotiable || false,
        phone_number: productData2.phone_number || "",
        user_id: Number(user?.id) || 0,
        address_id: productData2.address?.id || 0,
        color_id: productData2.color?.id || 0,
        has_document: productData2.has_document || false,
        ram: productData2.ram || 0,
        storage: productData2.storage || 0,
        other_model: productData2.other_model || "",
        condition: productData2.condition || false,
      })

      // Set address data
      if (productData2.address) {
        setAddressData({
          user_id: Number(user?.id) || 0,
          region_id: productData2.address.region_id || null,
          district_id: productData2.address.district_id || null,
          name: productData2.address.name || "",
          lat: productData2.address.lat || null,
          long: productData2.address.long || null,
          address: productData2.address.address || "",
        })
      }

      // Set select type based on existing data
      if (productData2.other_model) {
        setSelectType(SelectType.manual)
      } else {
        setSelectType(SelectType.default)
      }

      // Set location select type based on existing data
      if (productData2.address?.lat && productData2.address?.long) {
        setSelectTypeLocation(SelectType.manual)
      } else {
        setSelectTypeLocation(SelectType.default)
      }
    }
  }, [productData2, isLoading, user?.id])

  useEffect(() => {
    if (productData2?.product_image) {
      const imageUrls = productData2.product_image.map((img: any) => img.url || img.image_url)
      setExistingImages(imageUrls)
    }
  }, [productData2])

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("accessToken")
      if (token) {
        try {
          const decoded = jwtDecode(token)
          const currentTime = Date.now() / 1000 // seconds

          if (
            typeof decoded === "object" &&
            decoded &&
            "exp" in decoded &&
            typeof (decoded as any).exp === "number" &&
            (decoded as any).exp < currentTime
          ) {
            toast.info("Tizim sizni xavfsizlik uchun chiqarib qo'ydi. Iltimos, qayta kiring.")
            router.push("/login")
          }
        } catch (error) {
          toast.info("Tizim sizni xavfsizlik uchun chiqarib qo'ydi. Iltimos, qayta kiring.")
          router.push("/login")
        }
      } else {
        toast.info("Tizim sizni xavfsizlik uchun chiqarib qo'ydi. Iltimos, qayta kiring.")
        router.push("/login")
      }
    } else {
      toast.info("Tizim sizni xavfsizlik uchun chiqarib qo'ydi. Iltimos, qayta kiring.")
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (productData.brand_id && selectType === SelectType.default && productData.model_id) {
      const brandName = brands?.find((brand: Brand) => brand.id == productData.brand_id)?.name || ""
      const modelName = oneBrand?.model?.find((model: Model) => model.id == productData.model_id)?.name || ""
      setProductData((prev) => ({
        ...prev,
        title: `${brandName} ${modelName}`.trim(),
      }))
    } else if (productData.brand_id && selectType === SelectType.manual && productData.other_model) {
      const brandName = brands?.find((brand: Brand) => brand.id == productData.brand_id)?.name || ""
      setProductData((prev) => ({
        ...prev,
        title: `${brandName} ${productData.other_model}`.trim(),
      }))
    }
  }, [productData.brand_id, productData.model_id, productData.other_model, selectType, brands, oneBrand])

  // All function definitions
  const handleDeleteImage = async (imageUrl: string, index: number) => {
    try {
      // Find the image ID from productData2
      const imageToDelete = productData2?.product_image?.find(
        (img: any) => img.url === imageUrl || img.image_url === imageUrl
      )
      
      if (imageToDelete?.id) {
        console.log(imageToDelete);
        await deleteProductImage(imageToDelete.product_id,imageToDelete.id)
        // Remove the image from the UI
        setExistingImages(prev => prev.filter((_, i) => i !== index))
        toast.success("Rasm o'chirildi")
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Rasmni o'chirishda xatolik yuz berdi")
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)

      // Update local state to show preview
      setImages((prevImages) => [...prevImages, ...filesArray].slice(0, 10))

      // Upload each image to the server
      for (const file of filesArray) {
        try {
          addImage(
            {
              productId: Number(id),
              image: file,
            },
            {
              onSuccess: (data) => {
                console.log("Image added successfully:", data)
                if (data?.url) {
                  // Add the new image URL to existing images
                  setExistingImages((prev) => [...prev, data.url])
                  // Remove from local images since it's now on the server
                  setImages((prev) => prev.filter((img) => img !== file))
                }
              },
              onError: (error) => {
                console.error("Failed to upload image:", error)
                toast.error("Failed to upload image. Please try again.")
              },
            },
          )
        } catch (error) {
          console.error("Error uploading image:", error)
          toast.error("Error uploading image. Please try again.")
        }
      }
    }
  }

  const handleClickPublishing = async () => {
    try {
      if (selectType === SelectType.manual) {
        productData.model_id = 0
      } else if (selectType === SelectType.default) {
        productData.other_model = ""
      }

      if (!productData.brand_id && selectType === SelectType.default && !productData.model_id) {
        toast.info("Please select a brand and model")
        return
      } else if (!productData.brand_id && selectType === SelectType.manual && !productData.other_model) {
        toast.info("Please enter a model")
        return
      } else if (productData.year == "") {
        toast.info("Please select a year")
        return
      } else if (!productData.ram) {
        toast.info("Please select a ram")
        return
      } else if (!productData.storage) {
        toast.info("Please select a storage")
        return
      } else if (!existingImages.length && !images.length) {
        toast.info("Please add at least one image")
        return
      } else if (!productData.description) {
        toast.info("Please enter a description")
        return
      } else if (!addressData.region_id && selectTypeLocation === SelectType.default && !addressData.district_id) {
        toast.info("Please select a region and district")
        return
      } else if (!addressData.lat && selectTypeLocation === SelectType.manual && !addressData.long) {
        toast.info("Please enter a latitude and longitude")
        return
      } else if (!productData.price) {
        toast.info("Please enter a price")
        return
      } else if (!productData.color_id) {
        toast.info("Please select a color")
        return
      } else if (!productData.phone_number) {
        toast.info("Please enter a phone number")
        return
      }

      // First update the product
editProduct(
    [
      Number(id),
      {
        ...productData
        // Only include properties that are in UpdateProductProps
      },
      addressData
    ],
    {
      onSuccess: (response) => {
        // Then handle images if needed
        if (images.length > 0) {
          // Use useAddProductImage here
        }
        console.log("response: ", response)
        toast.success("Product updated successfully")
        router.push(`/productdetails/${id}`)
      }
    }
  )
    } catch (error: any) {
      console.log("Error in handleClickPublishing:", error)
      toast.error(error.response?.data?.message || "Failed to update product")
    }
  }

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Conditional rendering instead of early returns
  if (!id) {
    return <div>Redirecting...</div>
  }

  if (isLoading) {
    return <div>Loading product data...</div>
  }

  if (error || !productData2) {
    return <div>Error loading product data. Please try again.</div>
  }

  // Main component JSX
  return (
    <div className={style.create_product_wrapper}>
      <div className={style.container}>
        <p>Редактировать объявление</p>

        <form className={style.form}>
          {/* Brand Selection */}
          <div>
            <p>Выберите бренд телефона</p>
            <div>
              <div className={style.select_buttons_wrapper}>
                <button
                  type="button"
                  className={style.select_button + " " + (selectType === SelectType.default ? style.active : "")}
                  onClick={() => setSelectType(SelectType.default)}
                >
                  Выбрать
                </button>
                <button
                  type="button"
                  className={style.select_button + " " + (selectType === SelectType.manual ? style.active : "")}
                  onClick={() => setSelectType(SelectType.manual)}
                >
                  Ввести вручную
                </button>
              </div>

              <div>
                <div>
                  <p className={style.select_label}>Выберите бренд</p>
                  <select
                    className={style.select}
                    value={productData.brand_id || ""}
                    onChange={(e) => {
                      setProductData({
                        ...productData,
                        brand_id: +e.target.value,
                        model_id: 0,
                        other_model: "",
                      })
                    }}
                  >
                    <option disabled value="">
                      Выберите бренд телефона
                    </option>
                    {brands?.map((brand: Brand) => (
                      <option key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectType === SelectType.default ? (
                  <div>
                    <p className={style.select_label}>Выберите модель</p>
                    <select
                      className={style.select}
                      value={productData.model_id || ""}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          model_id: +e.target.value,
                          other_model: "",
                        })
                      }
                      disabled={!productData.brand_id}
                    >
                      <option disabled value="">
                        Выберите модель телефона
                      </option>
                      {oneBrand?.model?.map((model: Model) => (
                        <option key={model.id} value={model.id.toString()}>
                          {model.name}
                        </option>
                      )) || []}
                    </select>
                  </div>
                ) : (
                  <div>
                    <p className={style.select_label}>Выберите модель</p>
                    <input
                      className={style.input}
                      type="text"
                      placeholder="Выберите модель телефона"
                      value={productData.other_model || ""}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          other_model: e.target.value,
                          model_id: 0,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Year of Release */}
          <div className={style.form_section}>
            <p className={style.section_title}>Год выпуска</p>
            <div className={style.form_content}>
              <input
                className={style.input}
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                placeholder="Например: 2023"
                value={productData.year}
                onChange={(e) => setProductData({ ...productData, year: e.target.value })}
              />
            </div>
          </div>

          {/* Specifications */}
          <div>
            <p>Выберите характеристики</p>
            <div className={style.selects_wrapper}>
              <div>
                <p style={{ fontSize: "16px", marginBottom: "10px" }}>Выберите память</p>
                <select
                  className={style.select}
                  value={productData.storage || ""}
                  onChange={(e) => setProductData({ ...productData, storage: +e.target.value })}
                >
                  <option value="">Выберите память</option>
                  <option value="32">32 ГБ</option>
                  <option value="64">64 ГБ</option>
                  <option value="128">128 ГБ</option>
                  <option value="256">256 ГБ</option>
                  <option value="512">512 ГБ</option>
                  <option value="1024">1 ТБ</option>
                </select>
              </div>
              <div>
                <p style={{ fontSize: "16px", marginBottom: "10px" }}>Выберите оперативную память</p>
                <select
                  className={style.select}
                  value={productData.ram || ""}
                  onChange={(e) => setProductData({ ...productData, ram: +e.target.value })}
                >
                  <option value="">Выберите оперативную память</option>
                  <option value="2">2 ГБ</option>
                  <option value="4">4 ГБ</option>
                  <option value="6">6 ГБ</option>
                  <option value="8">8 ГБ</option>
                  <option value="12">12 ГБ</option>
                  <option value="16">16 ГБ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <p>Добавьте фото</p>
            <div className={style.image_upload_section}>
              <div className={style.photo_upload_container}>
                {/* Existing Images */}
                {existingImages.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className={`${style.image_preview} ${style.photo_box}`}>
                    <img src={process.env.NEXT_PUBLIC_BASE_URL+"/"+ imageUrl || "/placeholder.svg"} alt={`Existing ${index + 1}`} />
                    <button 
                      type="button" 
                      className={style.remove_image_btn} 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(imageUrl, index);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* New Images */}
                {images.map((image, index) => (
                  <div key={`new-${index}`} className={`${style.image_preview} ${style.photo_box}`}>
                    <img src={URL.createObjectURL(image) || "/placeholder.svg"} alt={`Preview ${index + 1}`} />
                    <button type="button" className={style.remove_image_btn} onClick={() => removeImage(index)}>
                      ×
                    </button>
                  </div>
                ))}

                {/* Add Photo Button */}
                {existingImages.length + images.length < 10 && (
                  <div className={`${style.upload_placeholder} ${style.photo_upload_box}`} onClick={triggerFileInput}>
                    <MdOutlineCameraAlt size={24} />
                    <span>Добавить фото</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={style.form__description}>
            <p>Описание</p>
            <textarea
              className={`${style.input} ${style.textarea}`}
              placeholder="Напишите что-нибудь..."
              value={productData.description}
              onChange={(e) => setProductData({ ...productData, description: e.target.value })}
              maxLength={1000}
            />
            <p className={style.text_area_max_characters}>Максимум 1000 символов</p>
          </div>

          {/* Location */}
          <div className={style.form__location}>
            <p>Адрес продажи</p>
            <div className={style.select_buttons_wrapper}>
              <button
                type="button"
                className={style.select_button + " " + (selectTypeLocation === SelectType.default ? style.active : "")}
                onClick={() => setSelectTypeLocation(SelectType.default)}
              >
                Выбрать
              </button>
              <button
                type="button"
                className={style.select_button + " " + (selectTypeLocation === SelectType.manual ? style.active : "")}
                onClick={() => setSelectTypeLocation(SelectType.manual)}
              >
                Ввести вручную
              </button>
            </div>

            {selectTypeLocation === SelectType.default ? (
              <div>
                <div>
                  <p className={style.select_label}>Выбрать регион</p>
                  <select
                    className={style.select}
                    value={addressData.region_id || ""}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        region_id: +e.target.value,
                        district_id: null, // Reset district when region changes
                      })
                    }
                  >
                    <option disabled value="">
                      Выберите регион
                    </option>
                    {regions?.map((region: Region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className={style.select_label}>Выбрать город или район</p>
                  <select
                    className={style.select}
                    value={addressData.district_id || ""}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        district_id: +e.target.value,
                      })
                    }
                    disabled={!addressData.region_id}
                  >
                    <option disabled value="">
                      Выберите город или район
                    </option>
                    {oneRegion?.district?.map((district: District) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <MapComponent addressData={addressData} setAddressData={setAddressData} />
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <p>Цена</p>
            <div className={style.form__price}>
              <input
                type="number"
                className={style.input}
                placeholder="Сумма"
                value={productData.price || ""}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    price: Number(e.target.value),
                  })
                }
              />
              <select
                style={{ width: "100px" }}
                className={style.select}
                value={productData.currency_id || "1"}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    currency_id: +e.target.value,
                  })
                }
              >
                {currency?.map((item: Currency) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Negotiable */}
            <div>
              <p>Цена окончательная?</p>
              <div className={style.negotiable_wrapper}>
                <div className={style.radio_wrapper}>
                  <input
                    name="negotiable"
                    type="radio"
                    checked={productData.negotiable === true}
                    onChange={() => setProductData({ ...productData, negotiable: true })}
                  />
                  <p>Торг есть</p>
                </div>
                <div className={style.radio_wrapper}>
                  <input
                    name="negotiable"
                    type="radio"
                    checked={productData.negotiable === false}
                    onChange={() => setProductData({ ...productData, negotiable: false })}
                  />
                  <p>Да, окончательная</p>
                </div>
              </div>
            </div>

            {/* Condition */}
            <div>
              <p>Состояние</p>
              <div className={style.negotiable_wrapper}>
                <div className={style.radio_wrapper}>
                  <input
                    name="condition"
                    type="radio"
                    checked={productData.condition === true}
                    onChange={() => setProductData({ ...productData, condition: true })}
                  />
                  <p>Новый</p>
                </div>
                <div className={style.radio_wrapper}>
                  <input
                    name="condition"
                    type="radio"
                    checked={productData.condition === false}
                    onChange={() => setProductData({ ...productData, condition: false })}
                  />
                  <p>Б/У</p>
                </div>
              </div>
            </div>

            {/* Documentation */}
            <div>
              <p>Коробка с документами</p>
              <div className={style.negotiable_wrapper}>
                <div className={style.radio_wrapper}>
                  <input
                    name="has_document"
                    type="radio"
                    checked={productData.has_document === true}
                    onChange={() => setProductData({ ...productData, has_document: true })}
                  />
                  <p>Есть</p>
                </div>
                <div className={style.radio_wrapper}>
                  <input
                    name="has_document"
                    type="radio"
                    checked={productData.has_document === false}
                    onChange={() => setProductData({ ...productData, has_document: false })}
                  />
                  <p>Нет</p>
                </div>
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div className={style.form__color}>
            <p>Цвет телефона</p>
            <div className={style.color_wrapper}>
              {colors?.map((item: Color) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setProductData({
                      ...productData,
                      color_id: +item.id,
                    })
                  }
                >
                  <div
                    className={`${style.color_box} ${productData.color_id === +item.id ? style.selected_color : ""}`}
                    style={{
                      backgroundColor: item.code || item.name,
                    }}
                  >
                    {productData.color_id === +item.id ? (
                      <>
                        <IoMdCheckmarkCircleOutline
                          style={{
                            position: "absolute",
                            top: "3px",
                            right: "3px",
                            color: "#A5DD9B",
                          }}
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <p>Номер телефона</p>
            <div className={style.phone_wrapper}>
              {phoneNumbers?.map((item: any) => (
                <div key={item.phone_number} className={style.radio_wrapper}>
                  <input
                    name="phone"
                    value={item.phone_number}
                    type="radio"
                    checked={productData.phone_number === item.phone_number}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        phone_number: e.target.value,
                      })
                    }
                  />
                  <p>{item.phone_number}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className={style.form__submit_buttons}>
            <a href="">Предпросмотр</a>
            <button type="button" onClick={handleClickPublishing}>
              {
                isLoading ? (
                  <AiOutlineLoading3Quarters />
                ) : (
                  "Сохранить изменения"
                )
              }
            </button>
          </div>
        </form>

        <SuccessCreateModel isOpen={createModal} setIsOpen={setCreateModal} />
      </div>
    </div>
  )
}

export default EditProduct
