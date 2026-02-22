CREATE TABLE `chatMessageEpisodes` (
	`id` text PRIMARY KEY NOT NULL,
	`messageId` text NOT NULL,
	`episodeId` text NOT NULL,
	`relevanceNote` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`messageId`) REFERENCES `chatMessages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`episodeId`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chatMessageEpisodes_messageId_idx` ON `chatMessageEpisodes` (`messageId`);--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionId` text NOT NULL,
	`message` text NOT NULL,
	`role` text NOT NULL,
	`tokenCount` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`sessionId`) REFERENCES `chatSessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `chatMessages_sessionId_idx` ON `chatMessages` (`sessionId`);--> statement-breakpoint
CREATE TABLE `chatSessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`title` text,
	`status` text DEFAULT 'active' NOT NULL,
	`interviewStyle` text NOT NULL,
	`targetPosition` text,
	`targetIndustry` text,
	`summary` text,
	`maxTokens` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `chatSessions_userId_idx` ON `chatSessions` (`userId`);