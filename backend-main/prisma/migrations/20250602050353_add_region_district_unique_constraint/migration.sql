/*
  Warnings:

  - A unique constraint covering the columns `[region_id,district_id]` on the table `address` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "address_region_id_district_id_key" ON "address"("region_id", "district_id");
