"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // App Router
import style from "./filter.module.scss";
import { useRegions } from "../../../hooks/regions";
import { useColors } from "../../../hooks/colors";
import { useBrands } from "../../../hooks/brand";
import { BASE_URL } from "../../../constant";

interface FilterState {
  regionId: number | null;
  topAdsOnly: boolean;
  condition: string;
  brandId: number | null;
  manualBrand: string;
  memoryId: number | null;
  colorId: number | null;
}

interface FilterSideProps {
  onClose?: () => void;
  onApply?: (filters: FilterState) => void;
}

const FilterSide = ({ onClose, onApply }: FilterSideProps) => {
  const router = useRouter();

  const [filters, setFilters] = useState<FilterState>({
    regionId: null,
    topAdsOnly: false,
    condition: "",
    brandId: null,
    manualBrand: "",
    memoryId: null,
    colorId: null,
  });

  const [showManualBrand, setShowManualBrand] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: colors, isLoading: colorsLoading } = useColors();

  const memoryOptions = [
    { id: 1, name: "64" },
    { id: 2, name: "128" },
    { id: 3, name: "256" },
    { id: 4, name: "512" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdown &&
        !(event.target as Element).closest(`.${style.selectContainer}`)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      regionId: null,
      topAdsOnly: false,
      condition: "",
      brandId: null,
      manualBrand: "",
      memoryId: null,
      colorId: null,
    });
    setShowManualBrand(false);
    setShowBrandDropdown(false);
    setOpenDropdown(null);
    router.push("/");
    if (onClose) {
      onClose();
    }
  };

  const handleApply = () => {
    const query: Record<string, string> = {};

    if (filters.colorId) {
      const color = colors?.find((c: any) => c.id === filters.colorId);
      if (color) query.color = color.name;
    }

    if (filters.memoryId) {
      const memory = memoryOptions.find((m) => m.id === filters.memoryId);
      if (memory) query.memory = memory.name;
    }

    if (filters.manualBrand) {
      query.othermodel = filters.manualBrand;
    }

    if (filters.brandId) {
      const brand = brands?.find((b: any) => b.id === filters.brandId);
      if (brand) query.brand = brand.name;
    }

    if (filters.condition) {
      if (filters.condition == "new") {
        query.condition = "true";
      } else {
        query.condition = "false";
      }
    }

    if (filters.topAdsOnly) {
      query["is-top"] = "true";
    }

    if (filters.regionId) {
      const region = regions?.find((r: any) => r.id === filters.regionId);
      if (region) query.region = region.name;
    }

    const searchParams = new URLSearchParams(query).toString();
    router.push(`/?${searchParams}`);

    onApply?.(filters);
    onClose?.();
  };

  const getSelectedName = (id: number | null, list: any[]) =>
    list?.find((item) => item.id === id)?.name || "Не указан";

  const getSelectedMemoryName = () =>
    memoryOptions.find((m) => m.id === filters.memoryId)?.name || "Не указан";

  return (
    <div className={style.filterContainer}>
      <div className={style.header}>
        <h1 className={style.title}>Фильтр</h1>
        <button className={style.closeButton} onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className={style.content}>
        {/* Region */}
        <div className={style.section}>
          <label className={style.label}>Регион</label>
          <div className={style.selectContainer}>
            <button
              className={style.selectTrigger}
              onClick={() =>
                setOpenDropdown(openDropdown === "region" ? null : "region")
              }
              disabled={regionsLoading}
            >
              <span>{getSelectedName(filters.regionId, regions || [])}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {openDropdown === "region" && (
              <div className={style.selectContent}>
                {regions?.map((region: any) => (
                  <button
                    key={region.id}
                    className={style.selectItem}
                    onClick={() => {
                      handleFilterChange("regionId", region.id);
                      setOpenDropdown(null);
                    }}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Ads */}
        <div className={style.toggleSection}>
          <label className={style.label}>Только TOP объявления</label>
          <button
            className={`${style.switch} ${
              filters.topAdsOnly ? style.switchOn : ""
            }`}
            onClick={() =>
              handleFilterChange("topAdsOnly", !filters.topAdsOnly)
            }
          >
            <div className={style.switchThumb} />
          </button>
        </div>

        {/* Condition */}
        <div className={style.section}>
          <label className={style.label}>Состояние</label>
          <div className={style.radioGroup}>
            {["new", "used"].map((type) => (
              <label className={style.radioItem} key={type}>
                <input
                  type="radio"
                  name="condition"
                  value={type}
                  checked={filters.condition === type}
                  onChange={(e) =>
                    handleFilterChange("condition", e.target.value)
                  }
                  className={style.radioInput}
                />
                <span className={style.radioCustom} />
                {type === "new" ? "Новый" : "Б/У"}
              </label>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className={style.section}>
          <label className={style.label}>Бренд</label>
          <div className={style.brandSection}>
            <button
              className={style.selectButton}
              onClick={() => setShowBrandDropdown(!showBrandDropdown)}
              disabled={brandsLoading}
            >
              Выбрать
            </button>

            <div className={style.manualBrandContainer}>
              <div
                className={style.manualBrandBox}
                onClick={() => setShowManualBrand(!showManualBrand)}
              >
                <span className={style.manualBrandText}>Ввести вручную</span>
              </div>
              {filters.manualBrand && (
                <div className={style.manualBrandTag}>
                  {filters.manualBrand}
                </div>
              )}
            </div>

            {showManualBrand && (
              <input
                type="text"
                placeholder="Введите бренд"
                value={filters.manualBrand}
                onChange={(e) =>
                  handleFilterChange("manualBrand", e.target.value)
                }
                className={style.manualInput}
              />
            )}

            {showBrandDropdown && (
              <div className={style.selectContainer}>
                <button
                  className={style.selectTrigger}
                  onClick={() =>
                    setOpenDropdown(openDropdown === "brand" ? null : "brand")
                  }
                >
                  <span>{getSelectedName(filters.brandId, brands || [])}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {openDropdown === "brand" && (
                  <div className={style.selectContent}>
                    {brands?.map((brand: any) => (
                      <button
                        key={brand.id}
                        className={style.selectItem}
                        onClick={() => {
                          handleFilterChange("brandId", brand.id);
                          setOpenDropdown(null);
                        }}
                      >
                        <div className={style.brandOption}>
                          {brand.logo && (
                            <img
                              src={`${BASE_URL}/uploads/${brand.logo}`}
                              alt={brand.name}
                              className={style.brandLogo}
                            />
                          )}
                          {brand.name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Memory */}
        <div className={style.section}>
          <label className={style.label}>Память</label>
          <div className={style.selectContainer}>
            <button
              className={style.selectTrigger}
              onClick={() =>
                setOpenDropdown(openDropdown === "memory" ? null : "memory")
              }
            >
              <span>{getSelectedMemoryName()}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {openDropdown === "memory" && (
              <div className={style.selectContent}>
                {memoryOptions.map((memory) => (
                  <button
                    key={memory.id}
                    className={style.selectItem}
                    onClick={() => {
                      handleFilterChange("memoryId", memory.id);
                      setOpenDropdown(null);
                    }}
                  >
                    {memory.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Color */}
        <div className={style.section}>
          <label className={style.label}>Цвет</label>
          <div className={style.colorGrid}>
            {colorsLoading ? (
              <div>Loading colors...</div>
            ) : (
              colors?.map((color: any) => (
                <button
                  key={color.id}
                  onClick={() => handleFilterChange("colorId", color.id)}
                  className={`${style.colorSwatch} ${
                    filters.colorId === color.id
                      ? style.colorSwatchSelected
                      : ""
                  }`}
                  style={{ backgroundColor: `${color.code || color.name}` }}
                  title={color.name}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className={style.bottomButtons}>
        <button className={style.resetButton} onClick={handleReset}>
          Сбросить
        </button>
        <button className={style.applyButton} onClick={handleApply}>
          Применить
        </button>
      </div>
    </div>
  );
};

export default FilterSide;
