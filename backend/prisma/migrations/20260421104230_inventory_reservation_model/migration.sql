/*
  Warnings:

  - You are about to drop the column `weightKg` on the `inventory` table. All the data in the column will be lost.
  - Added the required column `totalKg` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `buyerorder` MODIFY `status` ENUM('PLACED', 'CONFIRMED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PLACED';

-- AlterTable
ALTER TABLE `inventory` CHANGE COLUMN `weightKg` `totalKg` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `reservedKg` DECIMAL(65, 30) NOT NULL DEFAULT 0;


