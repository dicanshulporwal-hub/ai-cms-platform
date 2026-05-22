ALTER TABLE `pages`
  MODIFY `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT';

ALTER TABLE `blog_posts`
  MODIFY `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT';

ALTER TABLE `workflows`
  MODIFY `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'SUBMITTED';

CREATE TABLE `workflow_history` (
  `id` VARCHAR(191) NOT NULL,
  `contentType` ENUM('PAGE', 'BLOG') NOT NULL,
  `contentId` VARCHAR(191) NOT NULL,
  `fromStatus` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED') NULL,
  `toStatus` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED') NOT NULL,
  `action` VARCHAR(191) NOT NULL,
  `comment` TEXT NULL,
  `performedById` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `workflow_history_contentType_contentId_idx`(`contentType`, `contentId`),
  INDEX `workflow_history_performedById_idx`(`performedById`),
  INDEX `workflow_history_toStatus_idx`(`toStatus`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `entityType` VARCHAR(50) NULL,
  `entityId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `notifications_userId_isRead_idx`(`userId`, `isRead`),
  INDEX `notifications_entityType_entityId_idx`(`entityType`, `entityId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `workflow_history`
  ADD CONSTRAINT `workflow_history_performedById_fkey`
  FOREIGN KEY (`performedById`) REFERENCES `users`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
