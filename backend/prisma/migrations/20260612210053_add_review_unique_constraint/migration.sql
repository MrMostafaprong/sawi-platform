-- AlterTable
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_target_id_key" UNIQUE ("author_id", "target_id");
