CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`name` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` text NOT NULL,
	`status` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`assignedToEmployeeId` int NOT NULL,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`clockIn` bigint NOT NULL,
	`clockOut` bigint,
	`hoursWorked` float,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeLogs_id` PRIMARY KEY(`id`)
);
