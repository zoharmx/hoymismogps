CREATE TABLE `birthCharts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`personName` varchar(255),
	`gregorianDate` timestamp NOT NULL,
	`gregorianYear` int NOT NULL,
	`gregorianMonth` int NOT NULL,
	`gregorianDay` int NOT NULL,
	`birthHour` int NOT NULL,
	`birthMinute` int NOT NULL,
	`birthCity` varchar(255),
	`birthCountry` varchar(255),
	`birthLatitude` float NOT NULL,
	`birthLongitude` float NOT NULL,
	`birthTimezone` varchar(100) NOT NULL,
	`hebrewDate` varchar(255) NOT NULL,
	`hebrewYear` int NOT NULL,
	`hebrewMonth` varchar(100) NOT NULL,
	`hebrewDay` int NOT NULL,
	`adjustedHebrewDay` int NOT NULL,
	`isLeapYear` boolean NOT NULL,
	`yearInCycle` int NOT NULL,
	`cycleNumber` int NOT NULL,
	`jerusalemDate` timestamp NOT NULL,
	`jerusalemHour` int NOT NULL,
	`jerusalemMinute` int NOT NULL,
	`timeDifferenceHours` float NOT NULL,
	`dayOfWeek` int NOT NULL,
	`dayName` varchar(50) NOT NULL,
	`planet` varchar(50) NOT NULL,
	`sefira` varchar(50) NOT NULL,
	`primaryTrait` text,
	`talmudReference` varchar(255),
	`creationElement` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `birthCharts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compatibilityAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`birthChart1Id` int NOT NULL,
	`birthChart2Id` int NOT NULL,
	`compatibilityScore` int NOT NULL,
	`compatibilityLevel` varchar(100) NOT NULL,
	`analysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compatibilityAnalyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mazalAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`birthChartId` int NOT NULL,
	`characteristics` text NOT NULL,
	`strengths` text NOT NULL,
	`challenges` text NOT NULL,
	`talmudQuote` text,
	`zoharInsight` text,
	`spiritualPath` text,
	`lifeGuidance` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mazalAnalyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`birthChartId` int NOT NULL,
	`userId` int NOT NULL,
	`reportType` enum('natal_chart','mazal_analysis','complete') NOT NULL,
	`title` varchar(255) NOT NULL,
	`fileUrl` text,
	`fileKey` varchar(500),
	`fileSize` int,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`downloadCount` int NOT NULL DEFAULT 0,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
