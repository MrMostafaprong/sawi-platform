-- CreateEnum
CREATE TYPE "PortfolioItemType" AS ENUM ('IMAGE', 'VIDEO', 'LINK');

-- AlterTable
ALTER TABLE "user_portfolios" ADD COLUMN     "show_contact" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" TEXT DEFAULT 'male';

-- CreateTable
CREATE TABLE "portfolio_items" (
    "id" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "type" "PortfolioItemType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "caption" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "user_portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
