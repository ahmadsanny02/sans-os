import { pgTable, text, uuid, timestamp, integer, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// 1. Profiles (user info linked to Supabase Auth.users)
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(), // references auth.users.id
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// 2. Habits (Metadata for tracked habits)
export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").default("General"), // e.g. Health, Work, Mind, Finance
  frequency: text("frequency").default("daily").notNull(), // daily, weekly, or specific days
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 3. Habit Logs (Individual check-ins)
export const habitLogs = pgTable("habit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  habitId: uuid("habit_id")
    .references(() => habits.id, { onDelete: "cascade" })
    .notNull(),
  date: text("date").notNull(), // timezone-independent ISO string "YYYY-MM-DD"
  status: text("status").default("completed").notNull(), // completed, missed
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
})

// Relations for Habits & Logs
export const habitsRelations = relations(habits, ({ many }) => ({
  logs: many(habitLogs),
}))

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
}))

// 4. Reading Journal (Rating/Review conditionally rendered based on status === 'Completed')
export const readingJournal = pgTable("reading_journal", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  status: text("status").default("To Read").notNull(), // To Read, Reading, Completed
  rating: integer("rating"), // nullable (1-5)
  review: text("review"), // nullable
  currentProgress: text("current_progress"), // progress when status is Reading
  finishedAt: timestamp("finished_at"), // set when status goes to Completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 5. Vision Board (Drag-and-drop custom offset coordinates)
export const visionBoardItems = pgTable("vision_board_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  type: text("type").default("image").notNull(), // image, text
  content: text("content").notNull(), // Image URL or Text content
  xOffset: integer("x_offset").default(0).notNull(), // Drag coordinates X
  yOffset: integer("y_offset").default(0).notNull(), // Drag coordinates Y
  width: integer("width").default(200),
  height: integer("height").default(200),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 6. Timetable Blocks (Daily schedule timeline with custom duration bounds)
export const timetableBlocks = pgTable("timetable_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: text("start_time").notNull(), // e.g. "08:30"
  endTime: text("end_time").notNull(), // e.g. "10:00"
  title: text("title").notNull(),
  category: text("category").default("General"), // Work, Health, Leisure, Study
  color: text("color").default("blue"), // css class or hex color
  date: text("date"), // YYYY-MM-DD for one-off custom blocks (null for everyday fixed)
  isTodo: boolean("is_todo").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 7. Priorities (Top 5 priorities supporting rollover logic)
export const priorities = pgTable("priorities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // timezone-independent ISO string "YYYY-MM-DD"
  text: text("text").notNull(),
  orderIndex: integer("order_index").notNull(), // 0 to 4 (Top 5)
  completed: boolean("completed").default(false).notNull(),
  rolloverCount: integer("rollover_count").default(0).notNull(), // keeps track of rollovers
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 8. Vocabulary Logs (Language learning)
export const vocabularyLogs = pgTable("vocabulary_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  word: text("word").notNull(),
  partOfSpeech: text("part_of_speech").notNull(), // e.g., noun, verb, adjective, adverb
  definition: text("definition").notNull(),
  translation: text("translation").notNull(),
  exampleSentence: text("example_sentence"),
  masteryLevel: integer("mastery_level").default(1).notNull(), // scale 1-5
  memorized: boolean("memorized").default(false).notNull(),
  autoTranslation: text("auto_translation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 8.2 Writing Logs (Sentence practice logs)
export const writingLogs = pgTable("writing_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  vocabId: uuid("vocab_id"), // Nullable link to vocabulary log
  vocabWord: text("vocab_word"), // Store word text directly for quick access
  sentenceType: text("sentence_type"), // 'Positive', 'Negative', 'Interrogative'
  englishSentence: text("english_sentence").notNull(),
  indonesianTranslation: text("indonesian_translation").notNull(),
  autoTranslation: text("auto_translation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 8.3 Dialogue Logs (Q&A Dialogue practice logs)
export const dialogueLogs = pgTable("dialogue_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  vocabId: uuid("vocab_id")
    .references(() => vocabularyLogs.id, { onDelete: "cascade" })
    .notNull(),
  vocabWord: text("vocab_word").notNull(),
  englishQuestion: text("english_question").notNull(),
  indonesianQuestion: text("indonesian_question").notNull(),
  englishAnswer: text("english_answer").notNull(),
  indonesianAnswer: text("indonesian_answer").notNull(),
  autoTranslationQuestion: text("auto_translation_question"),
  autoTranslationAnswer: text("auto_translation_answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 9. Projects (Hierarchical project tracking)
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("Planning").notNull(), // Planning, In Progress, On Hold, Completed
  priority: text("priority").default("Medium").notNull(), // Low, Medium, High
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 10. Project Tasks (Hierarchical child relation)
export const projectTasks = pgTable("project_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  completed: boolean("completed").default(false).notNull(),
  priority: text("priority").default("Medium").notNull(), // Low, Medium, High
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Relations for Projects & Tasks
export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(projectTasks),
}))

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, {
    fields: [projectTasks.projectId],
    references: [projects.id],
  }),
}))

// 11. Bucket List
export const bucketList = pgTable("bucket_list", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 12. Daily To-Dos
export const dailyTodos = pgTable("daily_todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // timezone-independent ISO string "YYYY-MM-DD"
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 13. Daily Logs (Journal, Notes, Gratitude, Pic of the Day)
export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // timezone-independent ISO string "YYYY-MM-DD"
  journal: text("journal"),
  notes: text("notes"),
  gratitude: text("gratitude"),
  picUrl: text("pic_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

