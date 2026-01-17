import { apiErrorCodes } from "@blog/shared/codes";
import { sValidator as sv } from "@hono/standard-validator";
import { ValidationTargets } from "hono";
import { StandardSchemaV1 } from "zod/v4/core/standard-schema.cjs";

import { ApiException } from "../exceptions/api-exception";

export const sValidator = <
  T extends StandardSchemaV1,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) => {
  return sv(target, schema, (result) => {
    if (!result.success) {
      throw new ApiException(422, {
        code: apiErrorCodes.VALIDATION_ERROR,
        message: "Invalid request data.",
        details: result.error,
      });
    }
  });
};
