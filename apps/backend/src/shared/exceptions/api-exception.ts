import { ApiErrorCode } from "@blog/codes";
import { ContentfulStatusCode } from "hono/utils/http-status";

export class ApiException {
  public status: ContentfulStatusCode;
  public code: ApiErrorCode;
  public message: string;
  public details: unknown;

  public constructor(
    status: ContentfulStatusCode,
    options: {
      code: ApiErrorCode;
      message: string;
      details?: unknown;
    },
  ) {
    this.status = status;
    this.code = options.code;
    this.message = options.message;
    this.details = options.details;
  }
}
