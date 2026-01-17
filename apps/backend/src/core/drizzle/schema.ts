import { randomUUID } from "crypto";

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
});

export const refreshTokensTable = sqliteTable("refresh-tokens", {
  id: text()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  expiredAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }),
});
