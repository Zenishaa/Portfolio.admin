-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "github_id" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_github_id_key" ON "User"("github_id");
