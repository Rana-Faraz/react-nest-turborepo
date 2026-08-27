import { listDemoSubmissionsQuerySchema } from "@repo/contracts";
import type { ArgumentMetadata } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { AppValidationPipe } from "./app-validation.pipe.js";

function queryMetadata(): ArgumentMetadata {
  return {
    type: "query",
    data: undefined,
    metatype: Object,
    schema: listDemoSubmissionsQuerySchema,
  };
}

describe("AppValidationPipe", () => {
  it("returns the schema output so coercions and defaults reach handlers", async () => {
    const result = await new AppValidationPipe().transform(
      { limit: "3" },
      queryMetadata(),
    );

    expect(result).toEqual({ limit: 3 });
  });

  it("normalizes Standard Schema issues to the shared API error contract", async () => {
    await expect(
      new AppValidationPipe().transform({ limit: "0" }, queryMetadata()),
    ).rejects.toMatchObject({
      response: {
        statusCode: 400,
        error: {
          code: "validation_error",
          fieldErrors: {
            limit: [expect.any(String)],
          },
          issues: [
            expect.objectContaining({
              code: "too_small",
              path: ["limit"],
            }),
          ],
        },
      },
    });
  });

  it("fails fast when a request parameter omits its schema", async () => {
    await expect(
      new AppValidationPipe().transform(
        { limit: "3" },
        {
          type: "query",
          data: undefined,
          metatype: Object,
        },
      ),
    ).rejects.toThrow(
      "A Standard Schema is required for every @query() parameter",
    );
  });
});
