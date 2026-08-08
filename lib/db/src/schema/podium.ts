import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const categoriesTable = pgTable(
  "podium_categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
  },
  (table) => [uniqueIndex("podium_categories_name_idx").on(table.name)],
);

export const topicsTable = pgTable(
  "podium_topics",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categoriesTable.id),
    title: text("title").notNull(),
    angles: text("angles").array().notNull(),
  },
  (table) => [uniqueIndex("podium_topics_title_idx").on(table.title)],
);

export const sessionsTable = pgTable("podium_sessions", {
  id: serial("id").primaryKey(),
  sessionKey: text("session_key").notNull(),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topicsTable.id),
  researchSeconds: integer("research_seconds").notNull(),
  speakingSeconds: integer("speaking_seconds").notNull(),
  recordingUrl: text("recording_url"),
  transcript: text("transcript"),
  fillerCount: integer("filler_count"),
  fillersPerMinute: real("fillers_per_minute"),
  eyeContactPercent: integer("eye_contact_percent"),
  postureScore: integer("posture_score"),
  stillnessScore: integer("stillness_score"),
  visualSamples: integer("visual_samples"),
  feedbackSummary: text("feedback_summary"),
  feedbackStrengths: text("feedback_strengths").array(),
  feedbackImprovements: text("feedback_improvements").array(),
  feedbackNextTip: text("feedback_next_tip"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({
  id: true,
});
export const insertTopicSchema = createInsertSchema(topicsTable).omit({
  id: true,
});
export const insertSessionSchema = createInsertSchema(sessionsTable).omit({
  id: true,
  createdAt: true,
});

export type Category = z.infer<typeof insertCategorySchema>;
export type Topic = z.infer<typeof insertTopicSchema>;
export type Session = z.infer<typeof insertSessionSchema>;