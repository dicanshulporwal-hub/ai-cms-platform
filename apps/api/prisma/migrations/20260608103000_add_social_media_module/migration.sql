CREATE TABLE `social_accounts` (
  `id` VARCHAR(191) NOT NULL,
  `platformKey` VARCHAR(30) NOT NULL,
  `accountName` VARCHAR(255) NOT NULL,
  `accountHandle` VARCHAR(191) NULL,
  `accountIdExternal` VARCHAR(191) NULL,
  `profileUrl` VARCHAR(2048) NULL,
  `profileImageUrl` VARCHAR(2048) NULL,
  `status` ENUM('SOCIAL_CONNECTED', 'SOCIAL_DISCONNECTED', 'SOCIAL_TOKEN_EXPIRED', 'SOCIAL_ERROR', 'SOCIAL_DISABLED') NOT NULL DEFAULT 'SOCIAL_CONNECTED',
  `connectionType` VARCHAR(30) NOT NULL DEFAULT 'MANUAL_TOKEN',
  `accessTokenEncrypted` TEXT NULL,
  `refreshTokenEncrypted` TEXT NULL,
  `tokenExpiresAt` DATETIME(3) NULL,
  `scopesJson` JSON NULL,
  `settingsJson` JSON NULL,
  `connectedById` VARCHAR(191) NULL,
  `lastConnectedAt` DATETIME(3) NULL,
  `lastUsedAt` DATETIME(3) NULL,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `social_accounts_platformKey_idx` (`platformKey`),
  INDEX `social_accounts_status_idx` (`status`),
  INDEX `social_accounts_connectedById_idx` (`connectedById`),
  INDEX `social_accounts_deletedAt_idx` (`deletedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `social_posts` (
  `id` VARCHAR(191) NOT NULL,
  `sourceType` VARCHAR(30) NULL,
  `sourceId` VARCHAR(191) NULL,
  `title` VARCHAR(500) NOT NULL,
  `content` TEXT NOT NULL,
  `linkUrl` VARCHAR(2048) NULL,
  `mediaIdsJson` JSON NULL,
  `hashtagsJson` JSON NULL,
  `utmJson` JSON NULL,
  `status` ENUM('SOCIAL_POST_DRAFT', 'SOCIAL_POST_PENDING_APPROVAL', 'SOCIAL_POST_APPROVED', 'SOCIAL_POST_QUEUED', 'SOCIAL_POST_PUBLISHING', 'SOCIAL_POST_PUBLISHED', 'SOCIAL_POST_PARTIALLY_PUBLISHED', 'SOCIAL_POST_FAILED', 'SOCIAL_POST_CANCELLED') NOT NULL DEFAULT 'SOCIAL_POST_DRAFT',
  `createdById` VARCHAR(191) NULL,
  `approvedById` VARCHAR(191) NULL,
  `scheduledAt` DATETIME(3) NULL,
  `publishedAt` DATETIME(3) NULL,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `social_posts_sourceType_sourceId_idx` (`sourceType`, `sourceId`),
  INDEX `social_posts_status_idx` (`status`),
  INDEX `social_posts_scheduledAt_idx` (`scheduledAt`),
  INDEX `social_posts_deletedAt_idx` (`deletedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `social_post_targets` (
  `id` VARCHAR(191) NOT NULL,
  `socialPostId` VARCHAR(191) NOT NULL,
  `socialAccountId` VARCHAR(191) NOT NULL,
  `platformKey` VARCHAR(30) NOT NULL,
  `platformCaption` TEXT NULL,
  `platformMediaJson` JSON NULL,
  `status` ENUM('TARGET_PENDING', 'TARGET_QUEUED', 'TARGET_PUBLISHING', 'TARGET_PUBLISHED', 'TARGET_FAILED', 'TARGET_RETRY_SCHEDULED', 'TARGET_CANCELLED') NOT NULL DEFAULT 'TARGET_PENDING',
  `externalPostId` VARCHAR(500) NULL,
  `externalPostUrl` VARCHAR(2048) NULL,
  `errorMessage` TEXT NULL,
  `attemptCount` INTEGER NOT NULL DEFAULT 0,
  `lastAttemptAt` DATETIME(3) NULL,
  `publishedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `social_post_targets_socialPostId_idx` (`socialPostId`),
  INDEX `social_post_targets_socialAccountId_idx` (`socialAccountId`),
  INDEX `social_post_targets_platformKey_idx` (`platformKey`),
  INDEX `social_post_targets_status_idx` (`status`),
  INDEX `social_post_targets_publishedAt_idx` (`publishedAt`),
  CONSTRAINT `social_post_targets_socialPostId_fkey` FOREIGN KEY (`socialPostId`) REFERENCES `social_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `social_post_targets_socialAccountId_fkey` FOREIGN KEY (`socialAccountId`) REFERENCES `social_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `social_publish_logs` (
  `id` VARCHAR(191) NOT NULL,
  `socialPostTargetId` VARCHAR(191) NOT NULL,
  `platformKey` VARCHAR(30) NOT NULL,
  `socialAccountId` VARCHAR(191) NOT NULL,
  `status` VARCHAR(30) NOT NULL,
  `statusCode` INTEGER NULL,
  `errorMessage` TEXT NULL,
  `responsePreview` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `social_publish_logs_socialPostTargetId_idx` (`socialPostTargetId`),
  INDEX `social_publish_logs_platformKey_idx` (`platformKey`),
  INDEX `social_publish_logs_createdAt_idx` (`createdAt`),
  CONSTRAINT `social_publish_logs_socialPostTargetId_fkey` FOREIGN KEY (`socialPostTargetId`) REFERENCES `social_post_targets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `social_settings` (
  `id` VARCHAR(191) NOT NULL,
  `isEnabled` BOOLEAN NOT NULL DEFAULT true,
  `autoPostBlogsEnabled` BOOLEAN NOT NULL DEFAULT false,
  `autoPostNewsroomEnabled` BOOLEAN NOT NULL DEFAULT false,
  `autoPostAnnouncementsEnabled` BOOLEAN NOT NULL DEFAULT false,
  `requireApprovalBeforeSocialPost` BOOLEAN NOT NULL DEFAULT true,
  `defaultHashtagsJson` JSON NULL,
  `defaultUtmJson` JSON NULL,
  `maxRetries` INTEGER NOT NULL DEFAULT 3,
  `retryBackoffSeconds` INTEGER NOT NULL DEFAULT 60,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `social_settings` (
  `id`,
  `isEnabled`,
  `autoPostBlogsEnabled`,
  `autoPostNewsroomEnabled`,
  `autoPostAnnouncementsEnabled`,
  `requireApprovalBeforeSocialPost`,
  `defaultHashtagsJson`,
  `defaultUtmJson`,
  `maxRetries`,
  `retryBackoffSeconds`,
  `createdAt`,
  `updatedAt`
) VALUES (
  'default_social_settings',
  true,
  false,
  false,
  false,
  true,
  JSON_ARRAY(),
  JSON_OBJECT(),
  3,
  60,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
);

UPDATE `cms_modules`
SET
  `moduleName` = 'Social Media Publishing',
  `description` = 'Social account management and MVP social publishing workflow.',
  `routePath` = '/social-media',
  `isEnabledGlobally` = true,
  `isAdminVisible` = true,
  `isPublicEnabled` = false,
  `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `moduleKey` = 'social_media';
