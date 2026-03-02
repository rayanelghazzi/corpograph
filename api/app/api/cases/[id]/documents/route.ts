import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/errors";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const MAX_DOCS_PER_CASE = 15;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    if (caseData.status !== "DRAFT_INPUT") {
      return errorResponse("INVALID_STATE", "Can only upload documents in DRAFT_INPUT status");
    }

    const existingCount = await prisma.document.count({ where: { caseId: id } });

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const docKind = formData.get("doc_kind") as string | null;

    if (!files || files.length === 0) {
      return errorResponse("UPLOAD_ERROR", "No files provided");
    }

    if (existingCount + files.length > MAX_DOCS_PER_CASE) {
      return errorResponse(
        "UPLOAD_ERROR",
        `Maximum ${MAX_DOCS_PER_CASE} documents per case. Currently ${existingCount}, trying to add ${files.length}.`
      );
    }

    const caseUploadDir = path.join(UPLOAD_DIR, id);
    await fs.mkdir(caseUploadDir, { recursive: true });

    const documents = [];

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return errorResponse("UPLOAD_ERROR", `File ${file.name} is not a PDF`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const storagePath = path.join(caseUploadDir, `${Date.now()}-${file.name}`);
      await fs.writeFile(storagePath, buffer);

      const doc = await prisma.document.create({
        data: {
          caseId: id,
          filename: file.name,
          storagePath,
          docKind: docKind ?? null,
          sizeBytes: buffer.length,
        },
      });

      documents.push({
        id: doc.id,
        filename: doc.filename,
        doc_kind: doc.docKind,
        size_bytes: doc.sizeBytes,
        uploaded_at: doc.uploadedAt.toISOString(),
      });
    }

    return NextResponse.json({ documents }, { status: 201 });
  } catch (err) {
    console.error("POST /api/cases/:id/documents error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to upload documents");
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const caseData = await prisma.case.findUnique({ where: { id } });
    if (!caseData) {
      return errorResponse("NOT_FOUND", "Case not found");
    }

    const documents = await prisma.document.findMany({
      where: { caseId: id },
      orderBy: { uploadedAt: "asc" },
    });

    return NextResponse.json({
      documents: documents.map((d) => ({
        id: d.id,
        filename: d.filename,
        doc_kind: d.docKind,
        size_bytes: d.sizeBytes,
        uploaded_at: d.uploadedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("GET /api/cases/:id/documents error:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to list documents");
  }
}
