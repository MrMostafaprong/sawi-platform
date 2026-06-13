-- AlterEnum
ALTER TYPE "GroupVisibility" ADD VALUE 'FEMALE_ONLY';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "city" TEXT;
