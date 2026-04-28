CREATE TABLE "ai_post_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"access_level" "access_level" NOT NULL,
	"posts_per_day" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"prompt_hint" text,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_post_settings_access_level_unique" UNIQUE("access_level")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "generated_by_ai" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "posts_generated_by_ai_idx" ON "posts" USING btree ("generated_by_ai","created_at");