import style from "./product.module.scss";

const ProductSkeleton = () => {
  return (
    <div className={style.product_card_wrapper}>
      <div className={`${style.card_img} ${style.skeleton}`}>
        <div className={style.skeleton_image}></div>
      </div>
      <div className={style.card_content}>
        <div className={style.title_row}>
          <div
            className={`${style.skeleton_title} ${style.skeleton_pulse}`}
          ></div>
          <div
            className={`${style.skeleton_heart} ${style.skeleton_pulse}`}
          ></div>
        </div>

        <div className={style.specs_row}>
          <div className={style.spec_item}>
            <div
              className={`${style.skeleton_label} ${style.skeleton_pulse}`}
            ></div>
            <div
              className={`${style.skeleton_value} ${style.skeleton_pulse}`}
            ></div>
          </div>
          <div className={style.spec_item}>
            <div
              className={`${style.skeleton_label} ${style.skeleton_pulse}`}
            ></div>
            <div
              className={`${style.skeleton_value} ${style.skeleton_pulse}`}
            ></div>
          </div>
        </div>

        <div className={style.price_row}>
          <div
            className={`${style.skeleton_price} ${style.skeleton_pulse}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
