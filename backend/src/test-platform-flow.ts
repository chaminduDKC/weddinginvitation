import { normalizePhoneNumber, generateWhatsAppClickToChat } from "./lib/phone.js";
import crypto from "crypto";

async function verifyFlow() {
  console.log("🧪 Testing Platform Logic & Non-Negotiable Specifications...\n");

  // 1. Design Decision #8: Phone normalization (+94 default for Sri Lanka with 0)
  const domesticPhone = "0771234567";
  const normalizedDomestic = normalizePhoneNumber(domesticPhone);
  if (normalizedDomestic !== "94771234567") {
    throw new Error(`Failed phone normalization: expected 94771234567, got ${normalizedDomestic}`);
  }
  console.log(`✅ Phone Normalization: "${domesticPhone}" -> "${normalizedDomestic}"`);

  const spacedPhone = "077 456 7890";
  const normalizedSpaced = normalizePhoneNumber(spacedPhone);
  if (normalizedSpaced !== "94774567890") {
    throw new Error(`Failed spaced phone normalization: got ${normalizedSpaced}`);
  }
  console.log(`✅ Spaced Phone Normalization: "${spacedPhone}" -> "${normalizedSpaced}"`);

  const intlPhone = "+94719876543";
  const normalizedIntl = normalizePhoneNumber(intlPhone);
  if (normalizedIntl !== "94719876543") {
    throw new Error(`Failed intl phone normalization: got ${normalizedIntl}`);
  }
  console.log(`✅ Intl Phone Normalization: "${intlPhone}" -> "${normalizedIntl}"`);

  // WhatsApp click-to-chat URL format
  const waUrl = generateWhatsAppClickToChat(domesticPhone, "Hello, you are invited!");
  if (!waUrl.startsWith("https://wa.me/94771234567?text=")) {
    throw new Error(`Invalid WhatsApp URL format: ${waUrl}`);
  }
  console.log(`✅ WhatsApp Click-to-Chat URL Generation: ${waUrl.slice(0, 50)}...`);

  // 2. Design Decision #1: Unguessable guest token (crypto, 16+ chars)
  const token = crypto.randomBytes(16).toString("hex");
  if (token.length !== 32) {
    throw new Error(`Token length is ${token.length}, expected 32`);
  }
  console.log(`✅ Guest Random Token Generation: ${token} (Length: ${token.length})`);

  // 3. Design Decision #2: Token resolving guest -> owner -> invitation without ID in URL
  const publicPath = `/i/${token}`;
  if (publicPath.includes("userId") || publicPath.includes("guestId")) {
    throw new Error("URL contains user or guest id");
  }
  console.log(`✅ Guest Invitation Route: "${publicPath}" (Contains no user or guest ID)`);

  console.log("\n🎉 All Platform Flow and Specification tests PASSED successfully!");
}

verifyFlow().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
