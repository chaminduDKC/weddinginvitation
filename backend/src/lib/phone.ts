/**
 * Normalize phone numbers for WhatsApp click-to-chat links.
 * Non-negotiable design decision #8:
 * "WhatsApp = click-to-chat link https://wa.me/<E.164 number>?text=<encoded>.
 * Normalize phone numbers (default country code +94 for Sri Lanka when the number starts with 0)."
 */
export const normalizePhoneNumber = (rawPhone: string): string => {
  // Strip all whitespace, dashes, brackets, and plus signs
  let cleaned = rawPhone.replace(/[\s\-().+]/g, "");

  // If the number starts with 0 (standard Sri Lankan domestic format, e.g. 0771234567),
  // replace leading 0 with Sri Lankan country code 94
  if (cleaned.startsWith("0")) {
    cleaned = "94" + cleaned.substring(1);
  } else if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("1"))) {
    // If entered as 9 digits without leading 0 (e.g. 771234567)
    cleaned = "94" + cleaned;
  }

  return cleaned;
};

/**
 * Generate a WhatsApp click-to-chat URL.
 */
export const generateWhatsAppClickToChat = (
  phone: string,
  message: string
): string => {
  const normalized = normalizePhoneNumber(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};
