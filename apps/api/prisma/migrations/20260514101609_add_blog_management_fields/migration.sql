-- AlterTable
ALTER TABLE `blog_posts` ADD COLUMN `categoryId` VARCHAR(191) NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `featuredImage` VARCHAR(2048) NULL;

-- AlterTable
ALTER TABLE `categories` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `tags` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `blog_posts_categoryId_idx` ON `blog_posts`(`categoryId`);

-- CreateIndex
CREATE INDEX `blog_posts_deletedAt_idx` ON `blog_posts`(`deletedAt`);

-- CreateIndex
CREATE INDEX `categories_deletedAt_idx` ON `categories`(`deletedAt`);

-- CreateIndex
CREATE INDEX `tags_deletedAt_idx` ON `tags`(`deletedAt`);

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
