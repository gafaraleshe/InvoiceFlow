CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(255),
	`addressLine1` varchar(255),
	`addressLine2` varchar(255),
	`city` varchar(100),
	`postcode` varchar(20),
	`country` varchar(100) DEFAULT 'United Kingdom',
	`phone` varchar(50),
	`paymentTerms` int NOT NULL DEFAULT 30,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int NOT NULL,
	`invoiceNumber` varchar(20) NOT NULL,
	`status` enum('draft','sent','paid','overdue') NOT NULL DEFAULT 'draft',
	`issueDate` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
	`vatRate` decimal(5,2) NOT NULL DEFAULT '20.00',
	`vatAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`total` decimal(12,2) NOT NULL DEFAULT '0.00',
	`notes` text,
	`pdfUrl` varchar(512),
	`pdfKey` varchar(256),
	`sentAt` timestamp,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `line_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`quantity` decimal(10,2) NOT NULL DEFAULT '1.00',
	`unitPrice` decimal(12,2) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `line_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `clients_userId_idx` ON `clients` (`userId`);--> statement-breakpoint
CREATE INDEX `clients_email_idx` ON `clients` (`email`);--> statement-breakpoint
CREATE INDEX `invoices_userId_idx` ON `invoices` (`userId`);--> statement-breakpoint
CREATE INDEX `invoices_clientId_idx` ON `invoices` (`clientId`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `invoices_dueDate_idx` ON `invoices` (`dueDate`);--> statement-breakpoint
CREATE INDEX `invoices_invoiceNumber_idx` ON `invoices` (`invoiceNumber`);--> statement-breakpoint
CREATE INDEX `lineItems_invoiceId_idx` ON `line_items` (`invoiceId`);