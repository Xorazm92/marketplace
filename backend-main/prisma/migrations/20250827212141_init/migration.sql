/*
  Warnings:

  - A unique constraint covering the columns `[phone_number]` on the table `admin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR');

-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "activation_link" DROP NOT NULL;

-- AlterTable
ALTER TABLE "color" ADD COLUMN     "hex" TEXT;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "age_group_id" INTEGER,
ADD COLUMN     "developmental_skills" JSONB,
ADD COLUMN     "difficulty_level" TEXT,
ADD COLUMN     "educational_category_id" INTEGER,
ADD COLUMN     "event_type_id" INTEGER,
ADD COLUMN     "gender_specific" TEXT,
ADD COLUMN     "learning_objectives" JSONB,
ADD COLUMN     "multilingual_support" JSONB,
ADD COLUMN     "parental_guidance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "play_time" TEXT,
ADD COLUMN     "player_count" TEXT,
ADD COLUMN     "recommended_age_max" INTEGER,
ADD COLUMN     "recommended_age_min" INTEGER;

-- CreateTable
CREATE TABLE "child_profile" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "interests" JSONB,
    "allergies" JSONB,
    "avatar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "child_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "age_group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "min_age" INTEGER NOT NULL,
    "max_age" INTEGER,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "age_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_certification" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "required_for_age" TEXT,
    "logo" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_safety_certification" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "certification_id" INTEGER NOT NULL,
    "certificate_number" TEXT,
    "issued_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_safety_certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parental_control" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "child_profile_id" INTEGER NOT NULL,
    "spending_limit" DECIMAL(65,30),
    "daily_spending_limit" DECIMAL(65,30),
    "allowed_categories" JSONB,
    "blocked_categories" JSONB,
    "time_restrictions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parental_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educational_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educational_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_wrap" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "image_url" TEXT,
    "for_age" TEXT,
    "for_gender" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_wrap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_recommendation_engine" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "child_profile_id" INTEGER,
    "child_age" INTEGER,
    "preferences" JSONB NOT NULL,
    "recommended_products" JSONB NOT NULL,
    "recommendation_score" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_recommendation_engine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_colors" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "color_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_colors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "safety_certification_code_key" ON "safety_certification"("code");

-- CreateIndex
CREATE UNIQUE INDEX "product_safety_certification_product_id_certification_id_key" ON "product_safety_certification"("product_id", "certification_id");

-- CreateIndex
CREATE UNIQUE INDEX "parental_control_user_id_child_profile_id_key" ON "parental_control"("user_id", "child_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_colors_product_id_color_id_key" ON "product_colors"("product_id", "color_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_phone_number_key" ON "admin"("phone_number");

-- AddForeignKey
ALTER TABLE "child_profile" ADD CONSTRAINT "child_profile_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_safety_certification" ADD CONSTRAINT "product_safety_certification_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_safety_certification" ADD CONSTRAINT "product_safety_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "safety_certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parental_control" ADD CONSTRAINT "parental_control_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parental_control" ADD CONSTRAINT "parental_control_child_profile_id_fkey" FOREIGN KEY ("child_profile_id") REFERENCES "child_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_recommendation_engine" ADD CONSTRAINT "product_recommendation_engine_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_recommendation_engine" ADD CONSTRAINT "product_recommendation_engine_child_profile_id_fkey" FOREIGN KEY ("child_profile_id") REFERENCES "child_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_age_group_id_fkey" FOREIGN KEY ("age_group_id") REFERENCES "age_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_educational_category_id_fkey" FOREIGN KEY ("educational_category_id") REFERENCES "educational_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "color"("id") ON DELETE CASCADE ON UPDATE CASCADE;
