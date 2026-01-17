import { apiErrorCodes, loginSchema, registerSchema } from "@blog/shared";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

import { db } from "@/core/drizzle";
import { usersTable } from "@/core/drizzle/schema";
import { ApiException } from "@/shared/exceptions/api-exception";
import { sValidator } from "@/shared/wrappers/validator-wrapper";

import { ensureRefreshToken } from "./middlewares/ensure-refresh-token";
import {
  createAccessToken,
  createRefreshToken,
  deleteRefreshToken,
} from "./services/jwt";

export const authRouter = new Hono();

authRouter.post("/register", sValidator("json", registerSchema), async (c) => {
  const credentials = c.req.valid("json");

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, credentials.email))
    .limit(1);

  if (users.length) {
    throw new ApiException(409, {
      code: apiErrorCodes.EMAIL_ALREADY_EXISTS,
      message: "Email already exists.",
    });
  }

  credentials.password = await Bun.password.hash(credentials.password);

  await db.insert(usersTable).values(credentials);

  return c.body(null, 204);
});

authRouter.post("/login", sValidator("json", loginSchema), async (c) => {
  const credentials = c.req.valid("json");

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, credentials.email))
    .limit(1);

  if (!users.length) {
    throw new ApiException(401, {
      code: apiErrorCodes.INVALID_CREDENTIALS,
      message: "Email or password incorrect.",
    });
  }

  const user = users[0];

  const isMatch = await Bun.password.verify(
    credentials.password,
    user.password,
  );

  if (!isMatch) {
    throw new ApiException(401, {
      code: apiErrorCodes.INVALID_CREDENTIALS,
      message: "Email or password incorrect.",
    });
  }

  const accessToken = await createAccessToken({ sub: user.id });

  await createRefreshToken(user.id, c);

  return c.json({
    accessToken,
    id: user.id,
    name: user.name,
    email: user.email,
  });
});

authRouter.get("/refresh-token", ensureRefreshToken, async (c) => {
  const refreshToken = c.get("refreshToken");

  const accessToken = await createAccessToken({ sub: refreshToken.userId });

  await createRefreshToken(refreshToken.userId, c);

  return c.json({
    accessToken,
  });
});

authRouter.delete("/logout", ensureRefreshToken, async (c) => {
  const refreshToken = c.get("refreshToken");

  await deleteRefreshToken(refreshToken.id);

  return c.body(null, 204);
});
