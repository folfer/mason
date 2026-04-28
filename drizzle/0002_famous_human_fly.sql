CREATE TYPE "public"."submission_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "level_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"level" "masonic_level" NOT NULL,
	"certificate_url" text NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"reviewed_by_id" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_post_settings" DROP CONSTRAINT "ai_post_settings_access_level_unique";--> statement-breakpoint
ALTER TABLE "ai_post_settings" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "ai_template_id" text;--> statement-breakpoint
ALTER TABLE "level_submissions" ADD CONSTRAINT "level_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_submissions" ADD CONSTRAINT "level_submissions_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "level_submissions_user_idx" ON "level_submissions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "level_submissions_status_idx" ON "level_submissions" USING btree ("status","created_at");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_ai_template_id_ai_post_settings_id_fk" FOREIGN KEY ("ai_template_id") REFERENCES "public"."ai_post_settings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_post_settings_access_level_idx" ON "ai_post_settings" USING btree ("access_level");--> statement-breakpoint
CREATE INDEX "posts_ai_template_idx" ON "posts" USING btree ("ai_template_id","created_at");