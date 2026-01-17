import { eq } from "drizzle-orm";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";

import { db } from "@/core/drizzle";
import { refreshTokensTable } from "@/core/drizzle/schema";

export const createAccessToken = async (payload?: JWTPayload) => {
  return sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 5,
      ...payload,
    },
    process.env.JWT_SECRET_KEY,
  );
};

export const createRefreshToken = async (userId: number, c?: Context) => {
  await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.userId, userId));

  const [refreshToken] = await db
    .insert(refreshTokensTable)
    .values({ userId })
    .returning();

  if (c) {
    setCookie(c, process.env.REFRESH_TOKEN_COOKIE_NAME, refreshToken.id, {
      secure: true,
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN,
      sameSite: "Strict",
      expires: refreshToken.expiredAt,
    });
  }

  return refreshToken;
};

export const getRefreshToken = async (id: string) => {
  const [refreshToken] = await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.id, id))
    .limit(1);

  return refreshToken;
};

export const deleteRefreshToken = async (id: string) => {
  await db.delete(refreshTokensTable).where(eq(refreshTokensTable.id, id));
};
