CREATE TYPE "public"."preview_status" AS ENUM('ready', 'down', 'error');--> statement-breakpoint
CREATE TABLE "previews" (
	"id" serial PRIMARY KEY NOT NULL,
	"build_id" varchar(64) NOT NULL,
	"repo" text NOT NULL,
	"pr_number" integer,
	"commit_sha" varchar(64) NOT NULL,
	"branch" text NOT NULL,
	"actor" text NOT NULL,
	"frontend_url" text,
	"status" "preview_status" DEFAULT 'ready' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "previews_build_id_unique" UNIQUE("build_id")
);
--> statement-breakpoint
CREATE INDEX "repo_idx" ON "previews" USING btree ("repo");--> statement-breakpoint
CREATE INDEX "repo_pr_idx" ON "previews" USING btree ("repo","pr_number");--> statement-breakpoint
CREATE INDEX "status_idx" ON "previews" USING btree ("status");