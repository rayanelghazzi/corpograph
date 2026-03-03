import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STATUSES = [
  "DRAFT_INPUT",
  "IN_REVIEW_1",
  "IN_REVIEW_2",
  "IN_REVIEW_3",
  "IN_REVIEW_4",
  "IN_REVIEW_5",
  "ESCALATED",
  "APPROVED",
  "REJECTED",
] as const;

const COMPANY_NAMES = [
  "Apex Ventures Ltd.",
  "Birchwood Holdings Inc.",
  "Cedar Creek Partners",
  "Dune Capital Corp.",
  "Elm Street Investments",
  "Frost & Associates Inc.",
  "Granite Ridge Capital",
  "Harbour View Holdings",
  "Ironclad Industries Ltd.",
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function minimalCanonicalRecord(companyName: string) {
  return {
    subject_corporation: {
      legal_name: companyName,
      jurisdiction: "Ontario",
      registration_number: "12345678",
      registered_address: "100 King St W, Toronto, ON",
      incorporation_date: "2020-01-15",
      corporate_status: "active",
    },
    intake: {
      account_type: "corporate_investing",
      entity_type: "corporation",
    },
    account_intent: {
      account_purpose: "Investment and treasury operations",
      expected_monthly_volume: 50000,
      expected_transaction_types: ["transfers", "investments"],
      funding_sources: ["Operating revenue"],
      counterparty_geographies: ["Canada", "US"],
    },
    consent: {
      privacy_notice_version: "1.0",
      consented_at: new Date().toISOString(),
      acknowledged: true,
    },
  };
}

async function main() {
  const names = shuffle([...COMPANY_NAMES]).slice(0, STATUSES.length);

  for (let i = 0; i < STATUSES.length; i++) {
    const status = STATUSES[i];
    const companyName = names[i];

    const canonicalRecord =
      status === "DRAFT_INPUT"
        ? {
            intake: {
              account_type: "corporate_investing",
              entity_type: "corporation",
            },
            account_intent: {
              account_purpose: "General corporate banking",
              expected_monthly_volume: 10000,
              expected_transaction_types: ["payments"],
              funding_sources: ["Revenue"],
              counterparty_geographies: ["Canada"],
            },
            consent: {
              privacy_notice_version: "1.0",
              consented_at: new Date().toISOString(),
              acknowledged: true,
            },
          }
        : minimalCanonicalRecord(companyName);

    await prisma.case.create({
      data: {
        status,
        corporationName: status === "DRAFT_INPUT" ? null : companyName,
        canonicalRecord: canonicalRecord as object,
      },
    });

    console.log(`Created case: ${companyName} (${status})`);
  }

  console.log(`\nSeeded ${STATUSES.length} demo cases (one per status).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
