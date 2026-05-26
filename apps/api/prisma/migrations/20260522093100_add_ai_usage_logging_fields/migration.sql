ALTER TABLE `ai_usage_logs`
  ADD COLUMN `action` VARCHAR(191) NOT NULL DEFAULT 'unknown',
  ADD COLUMN `model` VARCHAR(191) NULL,
  ADD COLUMN `promptSummary` TEXT NULL,
  ADD COLUMN `tokenInput` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `tokenOutput` INTEGER NOT NULL DEFAULT 0;

UPDATE `ai_usage_logs`
SET
  `action` = `feature`,
  `model` = `modelName`,
  `tokenInput` = `promptTokens`,
  `tokenOutput` = `completionTokens`
WHERE `action` = 'unknown';

CREATE INDEX `ai_usage_logs_action_idx` ON `ai_usage_logs`(`action`);
