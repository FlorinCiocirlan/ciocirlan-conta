DO $$ BEGIN
 CREATE TYPE "public"."document_category" AS ENUM('facturi_emise', 'facturi_primite', 'bonuri', 'extrase_bancare', 'altele');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "months" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"month_start" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_month_unique" UNIQUE("user_id","month_start")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "document_category" NOT NULL,
	"filename" varchar(512) NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"mime_type" varchar(128) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "share_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(64) NOT NULL,
	"user_id" uuid NOT NULL,
	"month_id" uuid,
	"recipient_email" varchar(255),
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp,
	"access_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "share_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "months" ADD CONSTRAINT "months_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_month_id_months_id_fk" FOREIGN KEY ("month_id") REFERENCES "public"."months"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "share_links" ADD CONSTRAINT "share_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "share_links" ADD CONSTRAINT "share_links_month_id_months_id_fk" FOREIGN KEY ("month_id") REFERENCES "public"."months"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_month_idx" ON "months" USING btree ("user_id","month_start");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "month_idx" ON "documents" USING btree ("month_id");
