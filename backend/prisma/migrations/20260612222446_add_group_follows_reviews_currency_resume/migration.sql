-- AlterTable
ALTER TABLE "user_portfolios" ADD COLUMN     "resume_url" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currency" TEXT DEFAULT 'SAR';

-- CreateTable
CREATE TABLE "group_follows" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_reviews" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_follows_group_id_user_id_key" ON "group_follows"("group_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_reviews_group_id_user_id_key" ON "group_reviews"("group_id", "user_id");

-- AddForeignKey
ALTER TABLE "group_follows" ADD CONSTRAINT "group_follows_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_follows" ADD CONSTRAINT "group_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_reviews" ADD CONSTRAINT "group_reviews_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_reviews" ADD CONSTRAINT "group_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
