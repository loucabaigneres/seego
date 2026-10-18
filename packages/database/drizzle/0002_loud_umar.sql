CREATE TABLE "waitlist_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(150),
	"utm_term" varchar(150),
	"utm_content" varchar(150),
	"referrer" text,
	"landing_page_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_leads_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "waitlist_email_idx" ON "waitlist_leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "waitlist_source_idx" ON "waitlist_leads" USING btree ("utm_source");--> statement-breakpoint
CREATE INDEX "waitlist_campaign_idx" ON "waitlist_leads" USING btree ("utm_campaign");