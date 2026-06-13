-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "GroupMemberRole" AS ENUM ('OWNER', 'MEMBER');

-- AlterEnum (remove REVIEWED from ReportStatus)
ALTER TYPE "ReportStatus" RENAME TO "ReportStatus_old";
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');
ALTER TABLE "reports" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "reports" ALTER COLUMN "status" TYPE "ReportStatus" USING "status"::text::"ReportStatus";
DROP TYPE "ReportStatus_old";
ALTER TABLE "reports" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable: change User.gender from String? to Gender enum, update existing data
ALTER TABLE "users" ALTER COLUMN "gender" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "gender" TYPE "Gender" USING
  CASE
    WHEN "gender" = 'male' THEN 'MALE'::"Gender"
    WHEN "gender" = 'female' THEN 'FEMALE'::"Gender"
    ELSE NULL
  END;

-- AlterTable: change GroupMember.role from String to GroupMemberRole enum
ALTER TABLE "group_members" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "group_members" ALTER COLUMN "role" TYPE "GroupMemberRole" USING
  CASE
    WHEN "role" = 'MEMBER' THEN 'MEMBER'::"GroupMemberRole"
    WHEN "role" = 'OWNER' THEN 'OWNER'::"GroupMemberRole"
    ELSE 'MEMBER'::"GroupMemberRole"
  END;
ALTER TABLE "group_members" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

-- CreateIndex
CREATE INDEX "groups_creator_id_idx" ON "groups"("creator_id");

-- CreateIndex
CREATE INDEX "group_members_group_id_idx" ON "group_members"("group_id");

-- CreateIndex
CREATE INDEX "group_members_user_id_idx" ON "group_members"("user_id");

-- CreateIndex
CREATE INDEX "reviews_author_id_idx" ON "reviews"("author_id");

-- CreateIndex
CREATE INDEX "reviews_target_id_idx" ON "reviews"("target_id");

-- CreateIndex
CREATE INDEX "reports_reporter_id_idx" ON "reports"("reporter_id");

-- CreateIndex
CREATE INDEX "reports_target_id_idx" ON "reports"("target_id");

-- CreateIndex
CREATE INDEX "login_attempts_user_id_idx" ON "login_attempts"("user_id");

-- CreateIndex
CREATE INDEX "login_attempts_created_at_idx" ON "login_attempts"("created_at");
