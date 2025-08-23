CREATE TABLE "pages" (
	"page_id" text PRIMARY KEY NOT NULL,
	"files" jsonb NOT NULL,
	"checksum" text,
	"expires_at" timestamp with time zone NOT NULL,
	"delete_at_first_download" boolean NOT NULL,
	"delete_token" text NOT NULL,
	"password_hash" text,
	"encrypted" boolean NOT NULL,
	"downloads_num" integer NOT NULL,
	"author_token" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_pages" (
	"page_id" text PRIMARY KEY NOT NULL,
	"files" jsonb NOT NULL,
	"checksum" text,
	"expires_at" timestamp with time zone NOT NULL,
	"delete_at_first_download" boolean NOT NULL,
	"delete_token" text NOT NULL,
	"password_hash" text,
	"encrypted" boolean NOT NULL,
	"tmp_upload_id" text NOT NULL,
	"ws_channel_id" text NOT NULL,
	"set_expires_at_to" timestamp with time zone
);
