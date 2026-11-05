ALTER TABLE "discovery_content" ADD COLUMN "owner_user_id" text;--> statement-breakpoint
ALTER TABLE "imported_inspiration" ADD COLUMN "ai_report" text;--> statement-breakpoint
ALTER TABLE "imported_inspiration" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "imported_inspiration" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "imported_inspiration" ADD COLUMN "extracted_places" jsonb;