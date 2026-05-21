-- AlterTable
ALTER TABLE `pages` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `featuredImage` VARCHAR(2048) NULL;

-- CreateIndex
CREATE INDEX `pages_deletedAt_idx` ON `pages`(`deletedAt`);
