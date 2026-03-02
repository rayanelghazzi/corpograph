import { prisma } from "@/lib/prisma";
import { CanonicalRecord } from "@/lib/types";
import { ARTIFACT_NAMES } from "./phase-map";
import { renderArtifact } from "./templates";

export async function generateArtifacts(
  caseId: string,
  phase: number,
  artifactCodes: string[],
  canonicalRecord: CanonicalRecord
): Promise<string[]> {
  const generated: string[] = [];

  for (const code of artifactCodes) {
    const name = ARTIFACT_NAMES[code] ?? code;
    const output = renderArtifact(code, name, canonicalRecord);

    await prisma.artifact.upsert({
      where: {
        caseId_artifactCode: { caseId, artifactCode: code },
      },
      create: {
        caseId,
        artifactCode: code,
        name,
        phase,
        data: output.data,
        markdown: output.markdown,
        sourceDocuments: output.source_documents,
      },
      update: {
        data: output.data,
        markdown: output.markdown,
        sourceDocuments: output.source_documents,
        generatedAt: new Date(),
      },
    });

    generated.push(code);
  }

  return generated;
}
