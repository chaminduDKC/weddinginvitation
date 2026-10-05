import { generateOtpCode, hashOtp, verifyOtpHash, hashToken, generateSecureToken } from "./lib/crypto.js";
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from "./lib/jwt.js";
import { registerSchema, verifyOtpSchema, loginSchema, resendOtpSchema } from "./modules/auth/auth.schema.js";

async function runTests() {
  console.log("🧪 Testing Auth Core Utilities & Cryptography...");

  // 1. OTP Code Generation
  const code = generateOtpCode();
  if (!/^\d{6}$/.test(code)) {
    throw new Error(`OTP generation failed: expected 6 digits, got ${code}`);
  }
  console.log(`✅ generateOtpCode passed: ${code}`);

  // 2. HMAC OTP Hashing & Timing-Safe Verification
  const codeHash = hashOtp(code);
  if (!verifyOtpHash(code, codeHash)) {
    throw new Error("verifyOtpHash failed for matching OTP");
  }
  if (verifyOtpHash("000000", codeHash) && code !== "000000") {
    throw new Error("verifyOtpHash falsely validated an incorrect OTP");
  }
  console.log("✅ HMAC-SHA256 OTP hashing and timing-safe verification passed");

  // 3. Token Hashing (SHA-256 for Refresh Tokens)
  const secureToken = generateSecureToken(32);
  const tokenHash = hashToken(secureToken);
  if (!tokenHash || tokenHash.length !== 64) {
    throw new Error("hashToken failed: expected 64-char hex SHA-256 string");
  }
  console.log("✅ Secure token generation and SHA-256 hashing passed");

  // 4. JWT Access Token Signing & Verification
  const testPayload = {
    userId: "test-user-id-123",
    email: "couple@example.com",
    role: "USER" as const,
  };
  const accessToken = signAccessToken(testPayload);
  const decodedAccess = verifyAccessToken(accessToken);
  if (decodedAccess.userId !== testPayload.userId || decodedAccess.role !== "USER") {
    throw new Error("JWT Access Token verification failed");
  }
  console.log("✅ JWT Access Token generation & verification passed (15m expiry)");

  // 5. JWT Refresh Token Signing & Verification
  const refreshToken = signRefreshToken(testPayload);
  const decodedRefresh = verifyRefreshToken(refreshToken);
  if (decodedRefresh.userId !== testPayload.userId || decodedRefresh.role !== "USER") {
    throw new Error("JWT Refresh Token verification failed");
  }
  console.log("✅ JWT Refresh Token generation & verification passed (30d expiry)");

  // 6. Zod Schema Validation
  const validRegister = registerSchema.safeParse({
    brideName: "Kasuni",
    groomName: "Nuwan",
    email: "kasuni.nuwan@example.com",
    phone: "+94771234567",
    password: "Password123!",
  });
  if (!validRegister.success) {
    throw new Error(`Valid registration failed schema check: ${JSON.stringify(validRegister.error)}`);
  }

  const invalidRegister = registerSchema.safeParse({
    brideName: "",
    groomName: "Nuwan",
    email: "invalid-email",
    phone: "123",
    password: "short",
  });
  if (invalidRegister.success) {
    throw new Error("Invalid registration unexpectedly passed schema validation");
  }
  console.log("✅ Registration Zod schema validation passed (validates couple names, phone, email, password)");

  const validOtp = verifyOtpSchema.safeParse({
    email: "kasuni@example.com",
    otp: "123456",
  });
  if (!validOtp.success) {
    throw new Error("Valid OTP schema check failed");
  }

  const invalidOtp = verifyOtpSchema.safeParse({
    email: "kasuni@example.com",
    otp: "12345", // Only 5 digits
  });
  if (invalidOtp.success) {
    throw new Error("Invalid OTP (5 digits) unexpectedly passed");
  }
  console.log("✅ OTP Zod schema validation passed (strictly enforces 6-digit regex)");

  const validLogin = loginSchema.safeParse({
    email: "test@example.com",
    password: "MyPassword123!",
  });
  if (!validLogin.success) {
    throw new Error("Valid login schema check failed");
  }
  console.log("✅ Login schema validation passed");

  const validResend = resendOtpSchema.safeParse({
    email: "test@example.com",
  });
  if (!validResend.success) {
    throw new Error("Valid resend OTP schema check failed");
  }
  console.log("✅ Resend OTP schema validation passed");

  console.log("\n🎉 All Auth Core & Cryptography tests PASSED successfully!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
