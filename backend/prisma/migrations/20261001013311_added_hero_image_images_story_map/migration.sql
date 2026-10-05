-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "heroImageUrl" TEXT,
ADD COLUMN     "mapUrl" TEXT,
ADD COLUMN     "storyText" TEXT;
