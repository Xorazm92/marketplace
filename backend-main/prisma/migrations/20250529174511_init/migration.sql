/*
  Warnings:

  - Added the required column `logo` to the `brand` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "brand" ADD COLUMN     "logo" TEXT NOT NULL;
