import { MigrationInterface, QueryRunner } from 'typeorm';

export class historyUpdate1661856393384 implements MigrationInterface {
  name = 'historyUpdate1661856393384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_history" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "user_history" ADD "country" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_history" DROP COLUMN "country"`);
    await queryRunner.query(
      `ALTER TABLE "user_history" ADD "country" character varying`,
    );
  }
}
