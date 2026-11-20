CREATE TYPE "public"."admin_role_action" AS ENUM('grant', 'revoke');--> statement-breakpoint
CREATE TABLE "admin_role_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" "admin_role_action" NOT NULL,
	"target_user_id" text,
	"target_email" varchar(255) NOT NULL,
	"actor_user_id" text,
	"actor_email" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_role_events" ADD CONSTRAINT "admin_role_events_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_role_events" ADD CONSTRAINT "admin_role_events_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_role_events_created_at_idx" ON "admin_role_events" USING btree ("created_at");