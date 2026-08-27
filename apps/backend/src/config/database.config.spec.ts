import { describe, expect, it } from "vitest";
import { createDatabaseConfig } from "./database.config.js";

function reader(values: Record<string, string | undefined>) {
  return (key: string) => values[key];
}

describe("createDatabaseConfig", () => {
  it("uses explicit entities and only enables TLS in production", () => {
    const config = createDatabaseConfig(
      reader({
        DB_HOST: "localhost",
        DB_NAME: "esim",
        DB_USER: "postgres",
        NODE_ENV: "test",
      }),
    );

    expect(config).toMatchObject({
      type: "postgres",
      host: "localhost",
      database: "esim",
      username: "postgres",
      migrationsRun: true,
      synchronize: false,
    });
    expect("ssl" in config).toBe(false);
    expect(config.entities).toHaveLength(4);
  });

  it("fails early when a required database setting is absent", () => {
    expect(() =>
      createDatabaseConfig(
        reader({
          DB_HOST: "localhost",
          DB_NAME: "esim",
        }),
      ),
    ).toThrow("DB_USER is required");
  });
});
