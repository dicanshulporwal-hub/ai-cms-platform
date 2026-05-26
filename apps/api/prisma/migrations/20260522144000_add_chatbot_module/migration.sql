ALTER TABLE `chatbot_conversations`
  ADD COLUMN `sourcePage` VARCHAR(2048) NULL,
  ADD COLUMN `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

ALTER TABLE `leads`
  ADD COLUMN `sourcePage` VARCHAR(2048) NULL;

UPDATE `leads`
SET `sourcePage` = `source`
WHERE `sourcePage` IS NULL AND `source` IS NOT NULL;

CREATE TABLE `chatbot_settings` (
  `id` VARCHAR(191) NOT NULL,
  `isEnabled` BOOLEAN NOT NULL DEFAULT true,
  `greetingMessage` TEXT NOT NULL,
  `fallbackMessage` TEXT NOT NULL,
  `leadCaptureEnabled` BOOLEAN NOT NULL DEFAULT true,
  `supportEmail` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `chatbot_settings` (
  `id`,
  `isEnabled`,
  `greetingMessage`,
  `fallbackMessage`,
  `leadCaptureEnabled`,
  `supportEmail`,
  `createdAt`,
  `updatedAt`
) VALUES (
  'default_chatbot_settings',
  true,
  'Hi! How can I help you today?',
  'I do not have that information yet. Please contact support and we will help you.',
  true,
  NULL,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
);
