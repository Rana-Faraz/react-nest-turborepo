import type { MigrationInterface, QueryRunner } from "typeorm";

export class BetterAuth171787837746667 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "account"
      ADD COLUMN "issuer" text
    `);

    // This template only enables credential authentication. An external
    // provider requires a trusted, provider-specific issuer mapping and must
    // never be inferred from mutable account data.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM "account"
          WHERE "providerId" <> 'credential'
        ) THEN
          RAISE EXCEPTION
            'Better Auth 1.7 migration requires an explicit issuer map for non-credential account rows';
        END IF;
      END
      $$
    `);

    await queryRunner.query(`
      UPDATE "account"
      SET
        "issuer" = 'local:credential',
        "accountId" = "userId"
      WHERE "providerId" = 'credential'
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM "account"
          WHERE "issuer" IS NULL OR "accountId" IS NULL
        ) THEN
          RAISE EXCEPTION
            'Better Auth 1.7 account identity backfill left null identity fields';
        END IF;

        IF EXISTS (
          SELECT 1
          FROM "account"
          GROUP BY "issuer", "accountId"
          HAVING COUNT(*) > 1
        ) THEN
          RAISE EXCEPTION
            'Better Auth 1.7 account identity backfill found duplicate issuer/accountId pairs';
        END IF;
      END
      $$
    `);

    await queryRunner.query(`
      ALTER TABLE "account"
      ALTER COLUMN "issuer" SET NOT NULL
    `);

    for (const [table, columns] of Object.entries({
      account: [
        "accessTokenExpiresAt",
        "refreshTokenExpiresAt",
        "createdAt",
        "updatedAt",
      ],
      session: ["expiresAt", "createdAt", "updatedAt"],
      user: ["createdAt", "updatedAt"],
      verification: ["expiresAt", "createdAt", "updatedAt"],
    })) {
      for (const column of columns) {
        await queryRunner.query(`
          ALTER TABLE "${table}"
          ALTER COLUMN "${column}" TYPE timestamptz
          USING "${column}"::timestamp AT TIME ZONE 'UTC'
        `);
      }
    }

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_account_issuer_accountId"
      ON "account" ("issuer", "accountId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_account_userId" ON "account" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_session_userId" ON "session" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_verification_identifier"
      ON "verification" ("identifier")
    `);

    await queryRunner.query(`
      ALTER TABLE "account"
      ADD CONSTRAINT "FK_account_userId"
      FOREIGN KEY ("userId") REFERENCES "user"("id")
      ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "session"
      ADD CONSTRAINT "FK_session_userId"
      FOREIGN KEY ("userId") REFERENCES "user"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "session" DROP CONSTRAINT "FK_session_userId"
    `);
    await queryRunner.query(`
      ALTER TABLE "account" DROP CONSTRAINT "FK_account_userId"
    `);

    await queryRunner.query(`DROP INDEX "IDX_verification_identifier"`);
    await queryRunner.query(`DROP INDEX "IDX_session_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_account_userId"`);
    await queryRunner.query(`DROP INDEX "UQ_account_issuer_accountId"`);

    for (const [table, columns] of Object.entries({
      account: [
        "accessTokenExpiresAt",
        "refreshTokenExpiresAt",
        "createdAt",
        "updatedAt",
      ],
      session: ["expiresAt", "createdAt", "updatedAt"],
      user: ["createdAt", "updatedAt"],
      verification: ["expiresAt", "createdAt", "updatedAt"],
    })) {
      for (const column of columns) {
        await queryRunner.query(`
          ALTER TABLE "${table}"
          ALTER COLUMN "${column}" TYPE date
          USING ("${column}" AT TIME ZONE 'UTC')::date
        `);
      }
    }

    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "issuer"`);
  }
}
