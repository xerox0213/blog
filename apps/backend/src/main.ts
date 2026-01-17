import { apiErrorCodes } from "@blog/codes";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";

import { authRouter } from "./features/auth";
import { ApiException } from "./shared/exceptions/api-exception";

const app = new Hono().basePath("/api").use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  }),
  csrf({
    origin: process.env.FRONTEND_ORIGIN,
  }),
);

app.onError((error, c) => {
  if (error instanceof ApiException) {
    return c.json(
      {
        error: {
          code: error.code,
          status: error.status,
          message: error.message,
          details: error.details,
        },
      },
      error.status,
    );
  }

  if (error instanceof HTTPException) {
    return c.json(
      {
        error: {
          code: error.name,
          status: error.status,
          message: error.message,
          details:
            process.env.NODE_ENV === "development" ? error.cause : undefined,
        },
      },
      error.status,
    );
  }

  return c.json(
    {
      error: {
        code: apiErrorCodes.INTERNAL_SEVER_ERROR,
        status: 500,
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal Server Error.",
        details:
          process.env.NODE_ENV === "development" ? error.cause : undefined,
      },
    },
    500,
  );
});

const protectedRouter = new Hono().use(
  jwt({ secret: process.env.JWT_SECRET_KEY }),
);

app.route("/", authRouter);

app.route("/", protectedRouter);

export default app;
