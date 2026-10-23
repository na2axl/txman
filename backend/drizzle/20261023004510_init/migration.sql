CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "finances";--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "iam";--> statement-breakpoint
CREATE TYPE "finances"."transaction_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "finances"."customers" (
	"id" uuid PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_name_not_blank" CHECK (length(btrim("name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "finances"."transactions" (
	"id" uuid PRIMARY KEY,
	"customer_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"reference" varchar(22) NOT NULL UNIQUE,
	"amount" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" "finances"."transaction_status" DEFAULT 'PENDING'::"finances"."transaction_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_amount_positive" CHECK ("amount" > 0),
	CONSTRAINT "transactions_currency_format" CHECK ("currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "transactions_reference_format" CHECK ("reference" ~ '^TX[0-9]{14}[A-Z0-9]{6}$')
);
--> statement-breakpoint
CREATE TABLE "iam"."users" (
	"id" uuid PRIMARY KEY,
	"username" varchar(64) NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "customers_name_trgm_idx" ON "finances"."customers" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "transactions_customer_created_idx" ON "finances"."transactions" ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "transactions_creator_created_idx" ON "finances"."transactions" ("creator_id","created_at");--> statement-breakpoint
CREATE INDEX "transactions_status_created_idx" ON "finances"."transactions" ("status","created_at");--> statement-breakpoint
CREATE INDEX "transactions_created_idx" ON "finances"."transactions" ("created_at");--> statement-breakpoint
CREATE INDEX "transactions_reference_trgm_idx" ON "finances"."transactions" USING gin ("reference" gin_trgm_ops);--> statement-breakpoint
ALTER TABLE "finances"."transactions" ADD CONSTRAINT "transactions_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "finances"."customers"("id") ON DELETE RESTRICT;