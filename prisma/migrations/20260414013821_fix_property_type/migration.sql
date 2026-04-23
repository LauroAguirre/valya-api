/*
  Warnings:

  - You are about to alter the column `modo` on the `imoveis` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(10))` to `Enum(EnumId(7))`.

*/
-- AlterTable
ALTER TABLE `imoveis` MODIFY `modo` ENUM('SINGLE', 'MULTIPLE') NOT NULL DEFAULT 'SINGLE';
