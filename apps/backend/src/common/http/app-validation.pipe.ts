import { createValidationErrorResponse } from "@repo/contracts";
import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  StandardSchemaValidationPipe,
} from "@nestjs/common";

@Injectable()
export class AppValidationPipe extends StandardSchemaValidationPipe {
  constructor() {
    super({
      exceptionFactory: (issues) =>
        new BadRequestException(
          createValidationErrorResponse(
            issues.map((issue) => ({
              code:
                "code" in issue && typeof issue.code === "string"
                  ? issue.code
                  : "custom",
              message: issue.message,
              path: (issue.path ?? []).map((segment) => {
                const key = typeof segment === "object" ? segment.key : segment;
                return typeof key === "number" ? key : String(key);
              }),
            })),
          ),
        ),
    });
  }

  override async transform<T>(
    value: T,
    metadata: ArgumentMetadata,
  ): Promise<T> {
    if (metadata.type !== "custom" && !metadata.schema) {
      throw new InternalServerErrorException(
        `A Standard Schema is required for every @${metadata.type}() parameter`,
      );
    }

    return super.transform(value, metadata);
  }
}
