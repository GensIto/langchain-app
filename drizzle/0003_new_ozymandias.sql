CREATE TABLE `episodeTags` (
	`id` text PRIMARY KEY NOT NULL,
	`episodeId` text NOT NULL,
	`tagId` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`episodeId`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `episodes` (
	`id` text PRIMARY KEY NOT NULL,
	`logId` text NOT NULL,
	`title` text NOT NULL,
	`impactLevel` text NOT NULL,
	`situation` text NOT NULL,
	`task` text NOT NULL,
	`action` text NOT NULL,
	`result` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`logId`) REFERENCES `logs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `episodes_userId_logId_idx` ON `episodes` (`logId`);