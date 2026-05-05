-- AlterTable: add evolutionMessageId, status, deletedAt to messages
ALTER TABLE `messages`
  ADD COLUMN `id_mensagem_evolution` VARCHAR(191) NULL,
  ADD COLUMN `status` ENUM('PENDING','SENT','DELIVERED','READ','FAILED') NULL,
  ADD COLUMN `dt_exclusao` DATETIME(3) NULL;

-- CreateIndex: unique constraint on evolutionMessageId
CREATE UNIQUE INDEX `messages_id_mensagem_evolution_key` ON `messages`(`id_mensagem_evolution`);

-- AlterTable: add tags to leads
ALTER TABLE `leads`
  ADD COLUMN `tags` TEXT NULL;
