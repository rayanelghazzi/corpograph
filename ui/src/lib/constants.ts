export const PHASE_LABELS: Record<number, string> = {
  1: "Entity Verification",
  2: "Ownership Graph",
  3: "Reasonable Measures",
  4: "Screening & Tax",
  5: "Final Decision",
};

export const REGULATORY_TEXT =
  'Under PCMLTFR s.138(2), reasonable measures to confirm beneficial ownership accuracy must be different from the measures used to obtain the information initially, and must scale with the complexity and assessed risk of the corporate structure.';

export const PRIVACY_NOTICE =
  "By providing your information, you consent to its collection, use, and disclosure in accordance with applicable privacy legislation and our Privacy Policy. Your information will be used to verify your identity, assess your application, and comply with regulatory requirements including anti-money laundering and terrorist financing laws.";

export const TRANSACTION_TYPES = ["wire", "eft", "cheque", "ach"];
export const FUNDING_SOURCES = ["revenue", "investment", "loan", "other"];
