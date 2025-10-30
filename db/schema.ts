import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const previewStatus = pgEnum('preview_status', [
  'ready',
  'down',
  'error',
]);

export const previews = pgTable('previews', {
  id: serial('id').primaryKey(),
  build_id: varchar('build_id', { length: 64 }).notNull().unique(),
  repo: text('repo').notNull(),
  pr_number: integer('pr_number').notNull(), // Always present
  commit_sha: varchar('commit_sha', { length: 64 }).notNull(),
  branch: text('branch').notNull(),
  actor: text('actor').notNull(),
  frontend_url: text('frontend_url').notNull(), // Always present
  status: previewStatus('status').notNull().default('ready'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  // Indexes for common query patterns
  repoIdx: index('repo_idx').on(table.repo),
  repoPrIdx: index('repo_pr_idx').on(table.repo, table.pr_number),
  statusIdx: index('status_idx').on(table.status),
}));
