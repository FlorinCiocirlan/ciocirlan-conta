import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
  bigint,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categoryEnum = pgEnum('document_category', [
  'facturi_emise',
  'facturi_primite',
  'bonuri',
  'extrase_bancare',
  'altele',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const months = pgTable(
  'months',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    monthStart: timestamp('month_start', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    userMonthIdx: index('user_month_idx').on(t.userId, t.monthStart),
    userMonthUnique: unique('user_month_unique').on(t.userId, t.monthStart),
  }),
);

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    monthId: uuid('month_id')
      .notNull()
      .references(() => months.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    category: categoryEnum('category').notNull(),
    filename: varchar('filename', { length: 512 }).notNull(),
    blobUrl: text('blob_url').notNull(),
    blobPathname: text('blob_pathname').notNull(),
    mimeType: varchar('mime_type', { length: 128 }).notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    monthIdx: index('month_idx').on(t.monthId),
  }),
);

export const shareLinks = pgTable('share_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  monthId: uuid('month_id').references(() => months.id, { onDelete: 'cascade' }),
  recipientEmail: varchar('recipient_email', { length: 255 }),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastAccessedAt: timestamp('last_accessed_at'),
  accessCount: integer('access_count').default(0).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  months: many(months),
  documents: many(documents),
  shareLinks: many(shareLinks),
}));

export const monthsRelations = relations(months, ({ one, many }) => ({
  user: one(users, { fields: [months.userId], references: [users.id] }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  month: one(months, { fields: [documents.monthId], references: [months.id] }),
  user: one(users, { fields: [documents.userId], references: [users.id] }),
}));

export const shareLinksRelations = relations(shareLinks, ({ one }) => ({
  user: one(users, { fields: [shareLinks.userId], references: [users.id] }),
  month: one(months, { fields: [shareLinks.monthId], references: [months.id] }),
}));

export type User = typeof users.$inferSelect;
export type Month = typeof months.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type ShareLink = typeof shareLinks.$inferSelect;
export type DocumentCategory = (typeof categoryEnum.enumValues)[number];

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  facturi_emise: 'Facturi emise',
  facturi_primite: 'Facturi primite',
  bonuri: 'Bonuri fiscale',
  extrase_bancare: 'Extrase bancare',
  altele: 'Altele',
};
