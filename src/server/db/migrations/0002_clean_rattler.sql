ALTER TABLE "members" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_unique" UNIQUE("user_id");