-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'DONE');

-- AlterTable
ALTER TABLE "todos" ADD COLUMN "status" "Status" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "todos" ADD COLUMN "due_date" TIMESTAMP(3);