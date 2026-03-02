import { prisma } from "@/lib/prisma";

async function getPipeline(
  type: string
): Promise<((caseId: string, jobId: string) => Promise<void>) | null> {
  switch (type) {
    case "PHASE_1_RUN":
      return (await import("@/lib/pipelines/phase1")).runPhase1;
    case "PHASE_2_RUN":
      return (await import("@/lib/pipelines/phase2")).runPhase2;
    case "PHASE_3_RUN":
      return (await import("@/lib/pipelines/phase3")).runPhase3;
    case "PHASE_4_RUN":
      return (await import("@/lib/pipelines/phase4-stub")).runPhase4Stub;
    case "PHASE_5_RUN":
      return (await import("@/lib/pipelines/phase5-stub")).runPhase5Stub;
    default:
      return null;
  }
}

export async function enqueueJob(caseId: string, type: string) {
  const job = await prisma.job.create({
    data: { caseId, type, status: "queued" },
  });

  executeJob(job.id, caseId, type).catch((err) => {
    console.error(`Job ${job.id} crashed:`, err);
  });

  return job;
}

async function executeJob(jobId: string, caseId: string, type: string) {
  await prisma.job.update({
    where: { id: jobId },
    data: { status: "running", startedAt: new Date() },
  });

  const pipeline = await getPipeline(type);
  if (!pipeline) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "failed",
        error: `Unknown job type: ${type}`,
        completedAt: new Date(),
      },
    });
    return;
  }

  try {
    await pipeline(caseId, jobId);
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "succeeded", completedAt: new Date() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Job ${jobId} failed:`, message);
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "failed", error: message, completedAt: new Date() },
    });
  }
}
