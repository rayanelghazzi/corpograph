import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";
import archiver from "archiver";
import { PassThrough } from "stream";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    const artifacts = await prisma.artifact.findMany({
      where: { caseId: id },
      orderBy: { artifactCode: "asc" },
    });

    if (artifacts.length === 0) {
      return errorResponse("NOT_FOUND", "No artifacts to download");
    }

    const passthrough = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(passthrough);

    for (const art of artifacts) {
      const safeName = `${art.artifactCode}_${art.name.replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "_")}`;
      if (art.markdown) {
        archive.append(art.markdown, { name: `${safeName}.md` });
      }
      if (art.data) {
        archive.append(JSON.stringify(art.data, null, 2), { name: `${safeName}.json` });
      }
    }

    await archive.finalize();

    const chunks: Uint8Array[] = [];
    for await (const chunk of passthrough) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const buffer = Buffer.concat(chunks);

    const corpName = (caseData.corporationName ?? "case")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${corpName}_account_opening_package.zip"`,
      },
    });
  } catch (err) {
    console.error("GET /api/cases/:id/artifacts/download error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to generate ZIP");
  }
}
