export const PHASE_ARTIFACT_MAP: Record<number, string[]> = {
  0: ["ART-13"],
  1: ["ART-1", "ART-2", "ART-3", "ART-4", "ART-5", "ART-6", "ART-7"],
  2: ["ART-8"],
  3: ["ART-9", "ART-10", "ART-12"],
  4: ["ART-11", "ART-15", "ART-16"],
  5: ["ART-17", "ART-18", "ART-19", "ART-21", "ART-22", "ART-23"],
};

export const CONDITIONAL_ARTIFACTS: Record<string, { phase: number; condition: string }> = {
  "ART-14": { phase: 1, condition: "registry_discrepancies_found" },
};

export const ARTIFACT_NAMES: Record<string, string> = {
  "ART-1": "Corporate Identity Snapshot",
  "ART-2": "Registry Accuracy Attestation",
  "ART-3": "Director / Officer List",
  "ART-4": "Corporate Authority to Bind",
  "ART-5": "Authorized Signatory Record",
  "ART-6": "Signature Specimen",
  "ART-7": "Account Intended Use Record",
  "ART-8": "Beneficial Ownership & Structure",
  "ART-9": "Beneficial Ownership Confirmation Evidence",
  "ART-10": "Third Party Determination Record",
  "ART-11": "Sanctions Screening Log",
  "ART-12": "AML Risk Assessment",
  "ART-13": "Privacy Consent Record",
  "ART-14": "CBCA Discrepancy Report",
  "ART-15": "CRS/FATCA Self-Certification",
  "ART-16": "Corporate Investing KYC Profile",
  "ART-17": "Suitability Determination Record",
  "ART-18": "OEO Disclosure Acknowledgement",
  "ART-19": "CIPF Disclosure Acknowledgement",
  "ART-21": "Account Application & Agreements",
  "ART-22": "Records Retrieval Readiness Proof",
  "ART-23": "Account Opening Package Manifest",
};
