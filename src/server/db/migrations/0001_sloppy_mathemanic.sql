CREATE TABLE "app_settings" (
	"id" text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"org_name" text DEFAULT 'DAYONG' NOT NULL,
	"registration_no" text,
	"contact_email" text,
	"phone" text,
	"address" text,
	"monthly_dues" numeric(12, 2) DEFAULT '500' NOT NULL,
	"receipt_prefix" text DEFAULT 'OR-' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
