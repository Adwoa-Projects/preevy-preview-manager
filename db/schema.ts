import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const previewStatus = pgEnum('preview_status', [
  'ready',
  'down',
  'error',
]);

export const previews = pgTable('previews', {
  id: serial('id').primaryKey(),
  build_id: varchar('build_id', { length: 64 }).notNull(),
  repo: text('repo').notNull(),
  pr_number: integer('pr_number').notNull(),
  commit_sha: varchar('commit_sha', { length: 64 }).notNull(),
  branch: text('branch').notNull(),
  actor: text('actor').notNull(),
  frontend_url: text('frontend_url').notNull(),
  status: previewStatus('status').notNull().default('ready'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
