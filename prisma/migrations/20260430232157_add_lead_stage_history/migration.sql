/*
  Warnings:

  - You are about to drop the column `createdAt` on the `messages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_id_lead_fkey`;

-- DropIndex
DROP INDEX `messages_id_lead_createdAt_idx` ON `messages`;

-- AlterTable
ALTER TABLE `messages` DROP COLUMN `createdAt`,
    ADD COLUMN `dt_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `leads_historico_etapas` (
    `id_historico_etapa` VARCHAR(191) NOT NULL,
    `id_lead` VARCHAR(191) NOT NULL,
    `etapa_anterior` ENUM('QUALIFICATION', 'CADENCE', 'VISITATION', 'PROPOSAL', 'CONTRACT', 'WIN', 'LOSS') NULL,
    `etapa_atual` ENUM('QUALIFICATION', 'CADENCE', 'VISITATION', 'PROPOSAL', 'CONTRACT', 'WIN', 'LOSS') NOT NULL,
    `dt_alteracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_usuario` VARCHAR(191) NULL,
    `alterado_por_ia` BOOLEAN NOT NULL DEFAULT false,
    `observacao` TEXT NULL,

    INDEX `leads_historico_etapas_id_lead_dt_alteracao_idx`(`id_lead`, `dt_alteracao`),
    PRIMARY KEY (`id_historico_etapa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `messages_id_lead_dt_cadastro_idx` ON `messages`(`id_lead`, `dt_cadastro`);

-- AddForeignKey
ALTER TABLE `leads_historico_etapas` ADD CONSTRAINT `leads_historico_etapas_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads`(`id_lead`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads_historico_etapas` ADD CONSTRAINT `leads_historico_etapas_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imovel_ads_links` ADD CONSTRAINT `imovel_ads_links_id_imovel_fkey` FOREIGN KEY (`id_imovel`) REFERENCES `imoveis`(`id_imovel`) ON DELETE CASCADE ON UPDATE CASCADE;

