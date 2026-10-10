import fs from "fs";
import path from "path";

export interface BankAccount {
  label?: string;
  bankName: string;
  accountNumber: string;
  accountName?: string;
  branch?: string;
}

export interface BankDetails {
  accounts: BankAccount[];
  note?: string;
}

const DEFAULT_BANK_DETAILS: BankDetails = {
  accounts: [
    {
      label: "Primary Bank",
      bankName: "Bank of Ceylon",
      accountNumber: "83562296",
      accountName: "L C D Karunarathne",
      branch: "Matara",
    },
   
  ],
  note: "Please ensure your transfer reference or transaction receipt clearly states your registered phone number or email address.",
};

export const getBankDetailsData = (): BankDetails => {
  try {
    const baseDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

    const candidatePaths = [
      path.resolve(baseDir, "../data/bankDetails.json"),
      path.resolve(baseDir, "../../data/bankDetails.json"),
      path.resolve(process.cwd(), "src/data/bankDetails.json"),
      path.resolve(process.cwd(), "data/bankDetails.json"),
      path.resolve(process.cwd(), "dist/data/bankDetails.json"),
    ];

    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.accounts)) {
          return parsed as BankDetails;
        }
      }
    }
  } catch (err) {
    console.error("Error reading bank details json file:", err);
  }

  return DEFAULT_BANK_DETAILS;
};
