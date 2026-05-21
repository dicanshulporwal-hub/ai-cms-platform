ALTER TABLE `media`
  ADD COLUMN `originalName` VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN `caption` TEXT NULL,
  ADD COLUMN `folder` VARCHAR(191) NULL,
  ADD COLUMN `deletedAt` DATETIME(3) NULL;

UPDATE `media`
SET `originalName` = `fileName`
WHERE `originalName` = '';

ALTER TABLE `media` RENAME COLUMN `url` TO `fileUrl`;
ALTER TABLE `media` RENAME COLUMN `sizeBytes` TO `fileSize`;

UPDATE `media`
SET `fileSize` = 0
WHERE `fileSize` IS NULL;

ALTER TABLE `media`
  MODIFY `originalName` VARCHAR(255) NOT NULL,
  MODIFY `fileSize` INTEGER NOT NULL;

ALTER TABLE `audit_logs`
  ADD COLUMN `mediaId` VARCHAR(191) NULL;

CREATE INDEX `media_folder_idx` ON `media`(`folder`);
CREATE INDEX `media_mimeType_idx` ON `media`(`mimeType`);
CREATE INDEX `media_deletedAt_idx` ON `media`(`deletedAt`);
CREATE INDEX `audit_logs_mediaId_idx` ON `audit_logs`(`mediaId`);

ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_mediaId_fkey`
  FOREIGN KEY (`mediaId`) REFERENCES `media`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
