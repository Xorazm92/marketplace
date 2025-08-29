/*
  Warnings:

  - You are about to drop the `phone_number` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone_number]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone_number` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "phone_number" DROP CONSTRAINT "phone_number_user_id_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone_number" TEXT NOT NULL;

-- DropTable
DROP TABLE "phone_number";

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");
