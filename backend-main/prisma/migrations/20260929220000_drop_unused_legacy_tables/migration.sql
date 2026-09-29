-- MVP'dan tashqari, kodda ishlatilmaydigan jadvallar (chat, sotuvchi, ota-ona nazorati,
-- kupon, tavsiyalar, eski auth/OTP/to'lov). Egasi tasdiqlagan (2026-09-29): prod baza yo'q.
-- Olib tashlangan kod: docs/ICEBOX.md.
-- DropForeignKey
ALTER TABLE "ChatroomUsers" DROP CONSTRAINT "ChatroomUsers_chatroomId_fkey";

-- DropForeignKey
ALTER TABLE "ChatroomUsers" DROP CONSTRAINT "ChatroomUsers_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatroomId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ChatroomUsers" DROP CONSTRAINT "_ChatroomUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatroomUsers" DROP CONSTRAINT "_ChatroomUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "auth_method" DROP CONSTRAINT "auth_method_userId_fkey";

-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "child_profile" DROP CONSTRAINT "child_profile_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "email" DROP CONSTRAINT "email_user_id_fkey";

-- DropForeignKey
ALTER TABLE "model" DROP CONSTRAINT "model_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "parental_control" DROP CONSTRAINT "parental_control_child_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "parental_control" DROP CONSTRAINT "parental_control_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_age_group_id_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_educational_category_id_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_event_type_id_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "product_attribute_values" DROP CONSTRAINT "product_attribute_values_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "product_attribute_values" DROP CONSTRAINT "product_attribute_values_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_collection_items" DROP CONSTRAINT "product_collection_items_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "product_collection_items" DROP CONSTRAINT "product_collection_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_colors" DROP CONSTRAINT "product_colors_color_id_fkey";

-- DropForeignKey
ALTER TABLE "product_colors" DROP CONSTRAINT "product_colors_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_recommendation_engine" DROP CONSTRAINT "product_recommendation_engine_child_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "product_recommendation_engine" DROP CONSTRAINT "product_recommendation_engine_user_id_fkey";

-- DropForeignKey
ALTER TABLE "product_recommendations" DROP CONSTRAINT "product_recommendations_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_recommendations" DROP CONSTRAINT "product_recommendations_recommended_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_safety_certification" DROP CONSTRAINT "product_safety_certification_certification_id_fkey";

-- DropForeignKey
ALTER TABLE "product_safety_certification" DROP CONSTRAINT "product_safety_certification_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_views" DROP CONSTRAINT "product_views_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_views" DROP CONSTRAINT "product_views_user_id_fkey";

-- DropForeignKey
ALTER TABLE "review_image" DROP CONSTRAINT "review_image_review_id_fkey";

-- DropForeignKey
ALTER TABLE "search_queries" DROP CONSTRAINT "search_queries_clicked_product_id_fkey";

-- DropForeignKey
ALTER TABLE "search_queries" DROP CONSTRAINT "search_queries_user_id_fkey";

-- DropForeignKey
ALTER TABLE "seller" DROP CONSTRAINT "seller_user_id_fkey";

-- DropIndex
DROP INDEX "cart_item_cart_id_product_id_variant_id_key";

-- AlterTable
ALTER TABLE "cart_item" DROP COLUMN "variant_id";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "age_group_id",
DROP COLUMN "educational_category_id",
DROP COLUMN "event_type_id",
DROP COLUMN "seller_id";

-- DropTable
DROP TABLE "Chatroom";

-- DropTable
DROP TABLE "ChatroomUsers";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "_ChatroomUsers";

-- DropTable
DROP TABLE "age_group";

-- DropTable
DROP TABLE "auth_method";

-- DropTable
DROP TABLE "child_profile";

-- DropTable
DROP TABLE "color";

-- DropTable
DROP TABLE "coupon";

-- DropTable
DROP TABLE "educational_category";

-- DropTable
DROP TABLE "email";

-- DropTable
DROP TABLE "event_type";

-- DropTable
DROP TABLE "gift_wrap";

-- DropTable
DROP TABLE "model";

-- DropTable
DROP TABLE "otp";

-- DropTable
DROP TABLE "parental_control";

-- DropTable
DROP TABLE "payment";

-- DropTable
DROP TABLE "payment_method";

-- DropTable
DROP TABLE "product_attribute_values";

-- DropTable
DROP TABLE "product_attributes";

-- DropTable
DROP TABLE "product_collection_items";

-- DropTable
DROP TABLE "product_collections";

-- DropTable
DROP TABLE "product_colors";

-- DropTable
DROP TABLE "product_recommendation_engine";

-- DropTable
DROP TABLE "product_recommendations";

-- DropTable
DROP TABLE "product_safety_certification";

-- DropTable
DROP TABLE "product_variants";

-- DropTable
DROP TABLE "product_views";

-- DropTable
DROP TABLE "review_image";

-- DropTable
DROP TABLE "safety_certification";

-- DropTable
DROP TABLE "search_queries";

-- DropTable
DROP TABLE "seller";

-- DropEnum
DROP TYPE "CouponType";

-- DropEnum
DROP TYPE "MessageType";

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cart_id_product_id_key" ON "cart_item"("cart_id", "product_id");

