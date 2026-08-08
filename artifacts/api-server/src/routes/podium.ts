import { Router, type IRouter } from "express";
import { asc, desc, eq, sql } from "drizzle-orm";
import {
  CreateSessionBody,
  GetRandomTopicQueryParams,
  GetRandomTopicResponse,
  GetSessionSummaryQueryParams,
  GetSessionSummaryResponse,
  ListCategoriesResponse,
  ListSessionsQueryParams,
  ListSessionsResponse,
  ListTopicsQueryParams,
  ListTopicsResponse,
} from "@workspace/api-zod";
import {
  categoriesTable,
  db,
  sessionsTable,
  topicsTable,
} from "@workspace/db";
import { seedPodiumData } from "../lib/podium-seed";

const router: IRouter = Router();
let seedPromise: Promise<void> | null = null;

function ensureSeeded(): Promise<void> {
  seedPromise ??= seedPodiumData();
  return seedPromise;
}

function topicResponse(row: {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  angles: string[];
}) {
  return {
    id: row.id,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    title: row.title,
    angles: row.angles,
  };
}

router.get("/categories", async (req, res): Promise<void> => {
  await ensureSeeded();
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      description: categoriesTable.description,
      topicCount: sql<number>`count(${topicsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(topicsTable, eq(topicsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(asc(categoriesTable.name));

  req.log.info({ count: rows.length }, "Listed topic categories");
  res.json(ListCategoriesResponse.parse(rows));
});

router.get("/topics", async (req, res): Promise<void> => {
  await ensureSeeded();
  const parsed = ListTopicsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db
    .select({
      id: topicsTable.id,
      categoryId: topicsTable.categoryId,
      categoryName: categoriesTable.name,
      title: topicsTable.title,
      angles: topicsTable.angles,
    })
    .from(topicsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, topicsTable.categoryId))
    .where(
      parsed.data.categoryId
        ? eq(topicsTable.categoryId, parsed.data.categoryId)
        : undefined,
    )
    .orderBy(asc(topicsTable.title));

  res.json(ListTopicsResponse.parse(rows.map(topicResponse)));
});

router.get("/topics/random", async (req, res): Promise<void> => {
  await ensureSeeded();
  const parsed = GetRandomTopicQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .select({
      id: topicsTable.id,
      categoryId: topicsTable.categoryId,
      categoryName: categoriesTable.name,
      title: topicsTable.title,
      angles: topicsTable.angles,
    })
    .from(topicsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, topicsTable.categoryId))
    .where(
      parsed.data.categoryId
        ? eq(topicsTable.categoryId, parsed.data.categoryId)
        : undefined,
    )
    .orderBy(sql`random()`)
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "No topics found" });
    return;
  }

  res.json(GetRandomTopicResponse.parse(topicResponse(row)));
});

router.get("/sessions", async (req, res): Promise<void> => {
  await ensureSeeded();
  const parsed = ListSessionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db
    .select({
      id: sessionsTable.id,
      sessionKey: sessionsTable.sessionKey,
      topicId: sessionsTable.topicId,
      topicTitle: topicsTable.title,
      categoryName: categoriesTable.name,
      researchSeconds: sessionsTable.researchSeconds,
      speakingSeconds: sessionsTable.speakingSeconds,
      createdAt: sessionsTable.createdAt,
      recordingUrl: sessionsTable.recordingUrl,
      transcript: sessionsTable.transcript,
      fillerCount: sessionsTable.fillerCount,
      fillersPerMinute: sessionsTable.fillersPerMinute,
      eyeContactPercent: sessionsTable.eyeContactPercent,
      postureScore: sessionsTable.postureScore,
      stillnessScore: sessionsTable.stillnessScore,
      visualSamples: sessionsTable.visualSamples,
      feedbackSummary: sessionsTable.feedbackSummary,
      feedbackStrengths: sessionsTable.feedbackStrengths,
      feedbackImprovements: sessionsTable.feedbackImprovements,
      feedbackNextTip: sessionsTable.feedbackNextTip,
    })
    .from(sessionsTable)
    .innerJoin(topicsTable, eq(topicsTable.id, sessionsTable.topicId))
    .innerJoin(categoriesTable, eq(categoriesTable.id, topicsTable.categoryId))
    .where(eq(sessionsTable.sessionKey, parsed.data.sessionKey))
    .orderBy(desc(sessionsTable.createdAt))
    .limit(50);

  res.json(
    ListSessionsResponse.parse(
      rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      })),
    ),
  );
});

router.post("/sessions", async (req, res): Promise<void> => {
  await ensureSeeded();
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid session body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [inserted] = await db
    .insert(sessionsTable)
    .values(parsed.data)
    .returning();

  const [row] = await db
    .select({
      id: sessionsTable.id,
      sessionKey: sessionsTable.sessionKey,
      topicId: sessionsTable.topicId,
      topicTitle: topicsTable.title,
      categoryName: categoriesTable.name,
      researchSeconds: sessionsTable.researchSeconds,
      speakingSeconds: sessionsTable.speakingSeconds,
      createdAt: sessionsTable.createdAt,
      recordingUrl: sessionsTable.recordingUrl,
      transcript: sessionsTable.transcript,
      fillerCount: sessionsTable.fillerCount,
      fillersPerMinute: sessionsTable.fillersPerMinute,
      eyeContactPercent: sessionsTable.eyeContactPercent,
      postureScore: sessionsTable.postureScore,
      stillnessScore: sessionsTable.stillnessScore,
      visualSamples: sessionsTable.visualSamples,
      feedbackSummary: sessionsTable.feedbackSummary,
      feedbackStrengths: sessionsTable.feedbackStrengths,
      feedbackImprovements: sessionsTable.feedbackImprovements,
      feedbackNextTip: sessionsTable.feedbackNextTip,
    })
    .from(sessionsTable)
    .innerJoin(topicsTable, eq(topicsTable.id, sessionsTable.topicId))
    .innerJoin(categoriesTable, eq(categoriesTable.id, topicsTable.categoryId))
    .where(eq(sessionsTable.id, inserted.id));

  req.log.info({ sessionId: inserted.id }, "Saved speaking session");
  res.status(201).json(
    ListSessionsResponse.element.parse({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }),
  );
});

router.get("/sessions/summary", async (req, res): Promise<void> => {
  await ensureSeeded();
  const parsed = GetSessionSummaryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db
    .select({
      categoryName: categoriesTable.name,
      researchSeconds: sessionsTable.researchSeconds,
      speakingSeconds: sessionsTable.speakingSeconds,
    })
    .from(sessionsTable)
    .innerJoin(topicsTable, eq(topicsTable.id, sessionsTable.topicId))
    .innerJoin(categoriesTable, eq(categoriesTable.id, topicsTable.categoryId))
    .where(eq(sessionsTable.sessionKey, parsed.data.sessionKey));

  const categoryCounts = new Map<string, number>();
  let totalSpeakingSeconds = 0;
  let totalResearchSeconds = 0;
  for (const row of rows) {
    categoryCounts.set(
      row.categoryName,
      (categoryCounts.get(row.categoryName) ?? 0) + 1,
    );
    totalSpeakingSeconds += row.speakingSeconds;
    totalResearchSeconds += row.researchSeconds;
  }
  const favoriteCategory =
    [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  res.json(
    GetSessionSummaryResponse.parse({
      sessionCount: rows.length,
      totalSpeakingSeconds,
      totalResearchSeconds,
      favoriteCategory,
    }),
  );
});

export default router;