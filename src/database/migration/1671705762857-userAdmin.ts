import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1671705762857 implements MigrationInterface {
  name = 'userAdmin1671705762857';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "signupToken" TO "isAdmin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4" TO "UQ_b2033a3235871353c93700a0b60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_b2033a3235871353c93700a0b60"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isAdmin"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isAdmin" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isAdmin"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isAdmin" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_b2033a3235871353c93700a0b60" UNIQUE ("isAdmin")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME CONSTRAINT "UQ_b2033a3235871353c93700a0b60" TO "UQ_84f67c49f832f13e682ba6839f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "isAdmin" TO "signupToken"`,
    );
  }
}
