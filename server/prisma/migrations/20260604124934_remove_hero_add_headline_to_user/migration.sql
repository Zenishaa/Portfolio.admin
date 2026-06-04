/*
  Warnings:

  - You are about to drop the `Hero` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Hero" DROP CONSTRAINT "Hero_user_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "headline" VARCHAR(255),
ADD COLUMN     "sub_headline" VARCHAR(255);

-- DropTable
DROP TABLE "Hero";
