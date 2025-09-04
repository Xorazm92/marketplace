/*
  Warnings:

  - You are about to drop the column `activation_link` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `birth_date` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `hashed_refresh_token` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `is_premium` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `telegram_id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `Chatroom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatroomUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChatroomUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `age_group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cart_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `child_profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `color` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coupon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `currency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `district` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `educational_category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `email` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_type` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gift_wrap` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory_movement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `model` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_tracking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otp_verification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parental_control` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_method` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_attribute_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_attributes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_collection_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_collections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_colors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_recommendation_engine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_recommendations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_safety_certification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_views` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `region` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `review_image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `safety_certification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `search_queries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wishlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wishlist_item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ChatroomUsers" DROP CONSTRAINT "ChatroomUsers_chatroomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatroomUsers" DROP CONSTRAINT "ChatroomUsers_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_chatroomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ChatroomUsers" DROP CONSTRAINT "_ChatroomUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ChatroomUsers" DROP CONSTRAINT "_ChatroomUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."address" DROP CONSTRAINT "address_district_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."address" DROP CONSTRAINT "address_region_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."address" DROP CONSTRAINT "address_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cart" DROP CONSTRAINT "cart_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cart_item" DROP CONSTRAINT "cart_item_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cart_item" DROP CONSTRAINT "cart_item_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."cart_item" DROP CONSTRAINT "cart_item_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."category" DROP CONSTRAINT "category_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."child_profile" DROP CONSTRAINT "child_profile_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."district" DROP CONSTRAINT "district_region_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."email" DROP CONSTRAINT "email_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory" DROP CONSTRAINT "inventory_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."inventory_movement" DROP CONSTRAINT "inventory_movement_inventory_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."model" DROP CONSTRAINT "model_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order" DROP CONSTRAINT "order_billing_address_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order" DROP CONSTRAINT "order_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order" DROP CONSTRAINT "order_shipping_address_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order" DROP CONSTRAINT "order_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_item" DROP CONSTRAINT "order_item_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_item" DROP CONSTRAINT "order_item_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_payment" DROP CONSTRAINT "order_payment_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_tracking" DROP CONSTRAINT "order_tracking_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."parental_control" DROP CONSTRAINT "parental_control_child_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."parental_control" DROP CONSTRAINT "parental_control_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product" DROP CONSTRAINT "product_address_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product" DROP CONSTRAINT "product_age_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product" DROP CONSTRAINT "product_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product" DROP CONSTRAINT "product_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product" DROP CONSTRAINT "product_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product" DROP CONSTRAINT "product_educational_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product" DROP CONSTRAINT "product_event_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product" DROP CONSTRAINT "product_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_attribute_values" DROP CONSTRAINT "product_attribute_values_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_attribute_values" DROP CONSTRAINT "product_attribute_values_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_collection_items" DROP CONSTRAINT "product_collection_items_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_collection_items" DROP CONSTRAINT "product_collection_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_colors" DROP CONSTRAINT "product_colors_color_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_colors" DROP CONSTRAINT "product_colors_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_image" DROP CONSTRAINT "product_image_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_recommendation_engine" DROP CONSTRAINT "product_recommendation_engine_child_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_recommendation_engine" DROP CONSTRAINT "product_recommendation_engine_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_recommendations" DROP CONSTRAINT "product_recommendations_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_recommendations" DROP CONSTRAINT "product_recommendations_recommended_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_safety_certification" DROP CONSTRAINT "product_safety_certification_certification_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_safety_certification" DROP CONSTRAINT "product_safety_certification_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_variants" DROP CONSTRAINT "product_variants_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_views" DROP CONSTRAINT "product_views_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."product_views" DROP CONSTRAINT "product_views_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."review_image" DROP CONSTRAINT "review_image_review_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."search_queries" DROP CONSTRAINT "search_queries_clicked_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."search_queries" DROP CONSTRAINT "search_queries_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."wishlist" DROP CONSTRAINT "wishlist_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."wishlist_item" DROP CONSTRAINT "wishlist_item_product_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."wishlist_item" DROP CONSTRAINT "wishlist_item_wishlist_id_fkey";

-- DropIndex
DROP INDEX "public"."user_activation_link_idx";

-- DropIndex
DROP INDEX "public"."user_activation_link_key";

-- DropIndex
DROP INDEX "public"."user_is_verified_idx";

-- DropIndex
DROP INDEX "public"."user_slug_key";

-- DropIndex
DROP INDEX "public"."user_telegram_id_idx";

-- DropIndex
DROP INDEX "public"."user_telegram_id_key";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "activation_link",
DROP COLUMN "balance",
DROP COLUMN "birth_date",
DROP COLUMN "hashed_refresh_token",
DROP COLUMN "is_premium",
DROP COLUMN "password",
DROP COLUMN "slug",
DROP COLUMN "telegram_id";

-- DropTable
DROP TABLE "public"."Chatroom";

-- DropTable
DROP TABLE "public"."ChatroomUsers";

-- DropTable
DROP TABLE "public"."Message";

-- DropTable
DROP TABLE "public"."_ChatroomUsers";

-- DropTable
DROP TABLE "public"."address";

-- DropTable
DROP TABLE "public"."admin";

-- DropTable
DROP TABLE "public"."age_group";

-- DropTable
DROP TABLE "public"."brand";

-- DropTable
DROP TABLE "public"."cart";

-- DropTable
DROP TABLE "public"."cart_item";

-- DropTable
DROP TABLE "public"."category";

-- DropTable
DROP TABLE "public"."child_profile";

-- DropTable
DROP TABLE "public"."color";

-- DropTable
DROP TABLE "public"."coupon";

-- DropTable
DROP TABLE "public"."currency";

-- DropTable
DROP TABLE "public"."district";

-- DropTable
DROP TABLE "public"."educational_category";

-- DropTable
DROP TABLE "public"."email";

-- DropTable
DROP TABLE "public"."event_type";

-- DropTable
DROP TABLE "public"."gift_wrap";

-- DropTable
DROP TABLE "public"."inventory";

-- DropTable
DROP TABLE "public"."inventory_movement";

-- DropTable
DROP TABLE "public"."model";

-- DropTable
DROP TABLE "public"."order";

-- DropTable
DROP TABLE "public"."order_item";

-- DropTable
DROP TABLE "public"."order_payment";

-- DropTable
DROP TABLE "public"."order_tracking";

-- DropTable
DROP TABLE "public"."otp";

-- DropTable
DROP TABLE "public"."otp_verification";

-- DropTable
DROP TABLE "public"."parental_control";

-- DropTable
DROP TABLE "public"."payment";

-- DropTable
DROP TABLE "public"."payment_method";

-- DropTable
DROP TABLE "public"."product";

-- DropTable
DROP TABLE "public"."product_attribute_values";

-- DropTable
DROP TABLE "public"."product_attributes";

-- DropTable
DROP TABLE "public"."product_collection_items";

-- DropTable
DROP TABLE "public"."product_collections";

-- DropTable
DROP TABLE "public"."product_colors";

-- DropTable
DROP TABLE "public"."product_image";

-- DropTable
DROP TABLE "public"."product_recommendation_engine";

-- DropTable
DROP TABLE "public"."product_recommendations";

-- DropTable
DROP TABLE "public"."product_safety_certification";

-- DropTable
DROP TABLE "public"."product_variants";

-- DropTable
DROP TABLE "public"."product_views";

-- DropTable
DROP TABLE "public"."region";

-- DropTable
DROP TABLE "public"."review";

-- DropTable
DROP TABLE "public"."review_image";

-- DropTable
DROP TABLE "public"."safety_certification";

-- DropTable
DROP TABLE "public"."search_queries";

-- DropTable
DROP TABLE "public"."wishlist";

-- DropTable
DROP TABLE "public"."wishlist_item";

-- DropEnum
DROP TYPE "public"."AdminRole";

-- DropEnum
DROP TYPE "public"."CouponType";

-- DropEnum
DROP TYPE "public"."MessageType";

-- DropEnum
DROP TYPE "public"."MovementType";

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."isChecked";

-- CreateTable
CREATE TABLE "public"."auth_method" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT,
    "passwordHash" TEXT,
    "refreshToken" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_method_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_method_userId_idx" ON "public"."auth_method"("userId");

-- CreateIndex
CREATE INDEX "auth_method_provider_idx" ON "public"."auth_method"("provider");

-- CreateIndex
CREATE INDEX "auth_method_providerId_idx" ON "public"."auth_method"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_method_provider_providerId_key" ON "public"."auth_method"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "public"."auth_method" ADD CONSTRAINT "auth_method_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
