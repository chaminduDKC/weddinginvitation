import fs from "fs";
import path from "path";

export interface DevelopedBy {
  name: string;
  role: string;
  website?: string;
  description?: string;
}

export interface ContactDetails {
  companyName: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp?: string;
  email: string;
  address?: string;
  businessHours?: string;
  developedBy: DevelopedBy;
  socialLinks?: {
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
  };
  supportNotice?: string;
}

const DEFAULT_CONTACT_DETAILS: ContactDetails = {
  companyName: "WeddingPlatform.lk",
  tagline: "Sri Lanka's Luxury Digital Wedding Invitation Platform",
  description: "We craft unforgettable, elegant digital wedding invitations and seamless guest RSVP management experiences tailored for modern Sri Lankan celebrations.",
  phone: "+94 77 123 4567",
  whatsapp: "+94 77 123 4567",
  email: "support@weddingplatform.lk",
  address: "Colombo, Sri Lanka",
  businessHours: "Monday – Saturday: 9:00 AM – 7:00 PM (IST)",
  developedBy: {
    name: "Chamindu & Team",
    role: "Lead Architect & Full Stack Engineering",
    website: "https://weddingplatform.lk",
    description: "Engineered with modern React, Tailwind CSS, TypeScript, and secure Node.js infrastructure for high-performance wedding invitations.",
  },
  socialLinks: {
    whatsapp: "https://wa.me/94771234567",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
  },
  supportNotice: "Have a custom design inquiry, question about bank transfer approval, or need assistance setting up guest SMS/WhatsApp invites? Our concierge support is here to help.",
};

export const getContactDetailsData = (): ContactDetails => {
  try {
    const baseDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

    const candidatePaths = [
      path.resolve(baseDir, "../data/contactDetails.json"),
      path.resolve(baseDir, "../../data/contactDetails.json"),
      path.resolve(process.cwd(), "src/data/contactDetails.json"),
      path.resolve(process.cwd(), "data/contactDetails.json"),
      path.resolve(process.cwd(), "dist/data/contactDetails.json"),
    ];

    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && parsed.phone) {
          return parsed as ContactDetails;
        }
      }
    }
  } catch (err) {
    console.error("Error reading contact details json file:", err);
  }

  return DEFAULT_CONTACT_DETAILS;
};
