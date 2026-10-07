import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Seed Admin User
  const adminEmail = "chamindud061@gmail.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        brideName: "Platform",
        groomName: "Admin",
        phone: "+94764573054",
        role: Role.ADMIN,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    });
    console.log(`Seeded Admin: ${admin.email}`);
  } else {
    console.log(`Admin already exists: ${existingAdmin.email}`);
  }

  // 2. Seed Templates
  const templates = [
    {
      key: "eternal-noir",
      name: "Eternal Noir Luxury Editorial",
      description: "Cinematic, full-bleed luxury editorial invitation featuring romantic hero imagery, Roman numeral date, countdown clock, story chapters, photo archive, and interactive location.",
      priceLkr: 4500,
      thumbnailUrl: "https://res.cloudinary.com/nvhxrenm/image/upload/v1791351575/wedding_templates/wa7s9fwghses6n9zzagp.jpg",
      isActive: true,
    },
    {
      key: "classic-floral",
      name: "Classic Floral Elegance",
      description: "Timeless botanical designs with delicate watercolor florals and graceful typography.",
      priceLkr: 3500,
      thumbnailUrl: "https://res.cloudinary.com/nvhxrenm/image/upload/v1791351498/wedding_templates/jqzql4debslhj6ehqezp.jpg",
      isActive: true,
    },
   
    {
      key: "royal-vintage",
      name: "Royal Vintage Glamour",
      description: "Opulent golden accents, regal filigree embellishments, and classic romantic flair.",
      priceLkr: 4000,
      thumbnailUrl: "https://res.cloudinary.com/nvhxrenm/image/upload/v1791351530/wedding_templates/dnhaisfvqjzizagvtrnj.jpg",
      isActive: true,
    },
    {
      key: "tropical-bliss",
      name: "Tropical Island Bliss",
      description: "Sun-drenched palms and lush tropical foliage ideal for destination and beach weddings.",
      priceLkr: 3000,
      thumbnailUrl: "https://res.cloudinary.com/nvhxrenm/image/upload/v1791351446/wedding_templates/zgkvxtwevwsdn10oyuf1.jpg",
      isActive: true,
    },
  ];

  const existingTemps = await prisma.template.count();
  if(existingTemps != templates.length){
    for (const t of templates) {
      const upserted = await prisma.template.upsert({
        where: { key: t.key },
        update: {
          name: t.name,
          description: t.description,
          priceLkr: t.priceLkr,
          thumbnailUrl: t.thumbnailUrl,
          isActive: t.isActive,
        },
        create: t,
      });
      console.log(`Seeded template: [${upserted.key}] ${upserted.name}`);
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
