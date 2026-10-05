import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

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
        phone: "+94771234567",
        role: Role.ADMIN,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    });
    console.log(`✅ Seeded Admin: ${admin.email}`);
  } else {
    console.log(`ℹ️ Admin already exists: ${existingAdmin.email}`);
  }

  // 2. Seed Templates
  const templates = [
    {
      key: "eternal-noir",
      name: "Eternal Noir Luxury Editorial",
      description: "Cinematic, full-bleed luxury editorial invitation featuring romantic hero imagery, Roman numeral date, countdown clock, story chapters, photo archive, and interactive location.",
      priceLkr: 9500,
      thumbnailUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      key: "classic-floral",
      name: "Classic Floral Elegance",
      description: "Timeless botanical designs with delicate watercolor florals and graceful typography.",
      priceLkr: 7500,
      thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
    {
      key: "modern-minimalist",
      name: "Modern Minimalist Chic",
      description: "Clean lines, contemporary editorial aesthetic, and sophisticated whitespace.",
      priceLkr: 6000,
      thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
    {
      key: "royal-vintage",
      name: "Royal Vintage Glamour",
      description: "Opulent golden accents, regal filigree embellishments, and classic romantic flair.",
      priceLkr: 8500,
      thumbnailUrl: "https://images.unsplash.com/photo-1545232979-fbf68fe9f1f8?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
    {
      key: "tropical-bliss",
      name: "Tropical Island Bliss",
      description: "Sun-drenched palms and lush tropical foliage ideal for destination and beach weddings.",
      priceLkr: 6500,
      thumbnailUrl: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
  ];

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
    console.log(`✅ Seeded template: [${upserted.key}] ${upserted.name}`);
  }

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
