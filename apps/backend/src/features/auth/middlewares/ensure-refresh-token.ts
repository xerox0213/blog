import { apiErrorCodes } from "@blog/codes";
import { InferSelectModel } from "drizzle-orm";
import { deleteCookie, getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { refreshTokensTable } from "@/core/drizzle/schema";
import { ApiException } from "@/shared/exceptions/api-exception";

import { deleteRefreshToken, getRefreshToken } from "../services/jwt";

type Variables = {
  refreshToken: InferSelectModel<typeof refreshTokensTable>;
};

export const ensureRefreshToken = createMiddleware<{
  Variables: Variables;
}>(async (c, next) => {
  const refreshTokenId = getCookie(c, process.env.REFRESH_TOKEN_COOKIE_NAME);

  if (!refreshTokenId) {
    throw new ApiException(401, {
      code: apiErrorCodes.REFRESH_TOKEN_MISSING,
      message: "Missing refresh token.",
    });
  }

  const refreshToken = await getRefreshToken(refreshTokenId);

  if (!refreshToken) {
    throw new ApiException(401, {
      code: apiErrorCodes.REFRESH_TOKEN_INVALID,
      message: "Invalid refresh token.",
    });
  }

  if (refreshToken.expiredAt < new Date()) {
    await deleteRefreshToken(refreshToken.id);

    deleteCookie(c, process.env.REFRESH_TOKEN_COOKIE_NAME);

    throw new ApiException(401, {
      code: apiErrorCodes.REFRESH_TOKEN_EXPIRED,
      message: "Refresh token expired.",
    });
  }

  c.set("refreshToken", refreshToken);

  await next();
});
