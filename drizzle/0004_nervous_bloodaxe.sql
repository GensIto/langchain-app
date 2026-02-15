DROP INDEX `episodes_userId_logId_idx`;--> statement-breakpoint
ALTER TABLE `episodes` ADD `userId` text NOT NULL REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `episodes` ADD `docsPath` text;--> statement-breakpoint
CREATE UNIQUE INDEX `episodes_logId_idx` ON `episodes` (`logId`);--> statement-breakpoint
CREATE INDEX `episodes_userId_idx` ON `episodes` (`userId`);