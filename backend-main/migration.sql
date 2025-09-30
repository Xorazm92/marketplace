-- DropForeignKey
ALTER TABLE "phone_number" DROP CONSTRAINT "phone_number_user_id_fkey";

-- DropForeignKey
ALTER TABLE "address" DROP CONSTRAINT "address_user_id_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_address_id_fkey";

-- DropForeignKey
ALTER TABLE "product_image" DROP CONSTRAINT "product_image_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_color" DROP CONSTRAINT "product_color_product_id_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_user_id_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_address_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_product_id_fkey";

-- DropForeignKey
ALTER TABLE "order_payment" DROP CONSTRAINT "order_payment_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_payment" DROP CONSTRAINT "order_payment_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_product_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_user_id_fkey";

-- DropForeignKey
ALTER TABLE "wishlist" DROP CONSTRAINT "wishlist_user_id_fkey";

-- DropForeignKey
ALTER TABLE "wishlist_item" DROP CONSTRAINT "wishlist_item_wishlist_id_fkey";

-- DropForeignKey
ALTER TABLE "wishlist_item" DROP CONSTRAINT "wishlist_item_product_id_fkey";

-- DropIndex
DROP INDEX "product_slug_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "birth_date",
DROP COLUMN "hashed_refresh_token",
DROP COLUMN "last_online",
DROP COLUMN "phone_number";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "address_id",
DROP COLUMN "age_range",
DROP COLUMN "color",
DROP COLUMN "dimensions",
DROP COLUMN "educational_value",
DROP COLUMN "features",
DROP COLUMN "is_deleted",
DROP COLUMN "manufacturer",
DROP COLUMN "material",
DROP COLUMN "original_price",
DROP COLUMN "safety_info",
DROP COLUMN "size",
DROP COLUMN "slug",
DROP COLUMN "view_count",
DROP COLUMN "weight";

-- DropTable
DROP TABLE "phone_number";

-- DropTable
DROP TABLE "address";

-- DropTable
DROP TABLE "region";

-- DropTable
DROP TABLE "product_image";

-- DropTable
DROP TABLE "product_color";

-- DropTable
DROP TABLE "payment_method";

-- DropTable
DROP TABLE "order";

-- DropTable
DROP TABLE "order_item";

-- DropTable
DROP TABLE "order_payment";

-- DropTable
DROP TABLE "review";

-- DropTable
DROP TABLE "wishlist";

-- DropTable
DROP TABLE "wishlist_item";

