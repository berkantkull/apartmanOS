CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`kind` text DEFAULT 'Bilgilendirme' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `communities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`block_count` integer DEFAULT 1 NOT NULL,
	`unit_count` integer DEFAULT 1 NOT NULL,
	`monthly_due` integer DEFAULT 0 NOT NULL,
	`period` text NOT NULL,
	`invite_code` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `communities_invite_code_unique` ON `communities` (`invite_code`);--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`decision_no` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `dues` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`resident_name` text NOT NULL,
	`unit` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`due_date` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`amount` integer NOT NULL,
	`note` text,
	`expense_date` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'resident' NOT NULL,
	`unit` text,
	`joined_at` text NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_members_community_user` ON `members` (`community_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `residents` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`phone` text,
	`occupancy` text DEFAULT 'Ev sahibi' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE cascade
);
