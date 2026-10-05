import { prisma } from "./lib/prisma.js";
import { uploadPublicImageToCloudinary } from "./lib/cloudinary.js";

async function runTest() {
  console.log("🧪 Testing Admin Template Management Flow...\n");

  // 1. Fetch templates
  const templates = await prisma.template.findMany({
    orderBy: { priceLkr: "asc" },
  });
  console.log(`✅ Retrieved ${templates.length} templates from database.`);
  if (templates.length === 0) {
    throw new Error("No templates found in database. Seed needed.");
  }

  const target = templates[0]!;
  console.log(`📌 Target Template before update: [${target.key}] "${target.name}"`);

  // 2. Test updating template name
  const updatedName = `${target.name} (Updated)`;
  const updated = await prisma.template.update({
    where: { id: target.id },
    data: { name: updatedName },
  });
  if (updated.name !== updatedName) {
    throw new Error(`Template name was not updated correctly: ${updated.name}`);
  }
  console.log(`✅ Template name updated successfully: "${updated.name}"`);

  // 3. Test mock/public thumbnail upload
  const dummyBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  const uploadResult = await uploadPublicImageToCloudinary(dummyBuffer, "image/png", `test_${target.key}`);
  if (!uploadResult.secureUrl) {
    throw new Error("Failed to generate secure thumbnail URL");
  }
  console.log(`✅ Thumbnail uploaded successfully (URL: ${uploadResult.secureUrl.slice(0, 40)}...)`);

  // 4. Update thumbnail on template
  const withThumbnail = await prisma.template.update({
    where: { id: target.id },
    data: { thumbnailUrl: uploadResult.secureUrl },
  });
  if (withThumbnail.thumbnailUrl !== uploadResult.secureUrl) {
    throw new Error("Thumbnail URL was not stored on template");
  }
  console.log(`✅ Template thumbnail updated on record.`);

  // 5. Restore original name to keep DB clean
  await prisma.template.update({
    where: { id: target.id },
    data: { name: target.name, thumbnailUrl: target.thumbnailUrl },
  });
  console.log(`✅ Restored original template name & thumbnail.`);

  console.log("\n🎉 Admin Template Management Test Completed Successfully!");
  await prisma.$disconnect();
}

runTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
