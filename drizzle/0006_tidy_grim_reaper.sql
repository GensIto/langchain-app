PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chatMessages` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionId` text NOT NULL,
	`message` text NOT NULL,
	`role` text NOT NULL,
	`tokenCount` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`sessionId`) REFERENCES `chatSessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_chatMessages`("id", "sessionId", "message", "role", "tokenCount", "createdAt", "updatedAt") SELECT "id", "sessionId", "message", "role", "tokenCount", "createdAt", "updatedAt" FROM `chatMessages`;--> statement-breakpoint
DROP TABLE `chatMessages`;--> statement-breakpoint
ALTER TABLE `__new_chatMessages` RENAME TO `chatMessages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `chatMessages_sessionId_idx` ON `chatMessages` (`sessionId`);