CREATE TABLE "admins" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "password" text NOT NULL,
  "full_name" text NOT NULL,
  "role" text NOT NULL DEFAULT 'admin',
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "admins_email_unique" UNIQUE("email")
); 