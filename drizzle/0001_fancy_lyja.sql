CREATE TABLE `links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceNoteId` int NOT NULL,
	`targetNoteId` int NOT NULL,
	`relationshipType` varchar(100),
	`evidence` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`tvObjectType` varchar(50),
	`tvObjectAttributes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `sourceNoteId_idx` ON `links` (`sourceNoteId`);--> statement-breakpoint
CREATE INDEX `targetNoteId_idx` ON `links` (`targetNoteId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `links` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notes` (`userId`);--> statement-breakpoint
CREATE INDEX `title_idx` ON `notes` (`title`);