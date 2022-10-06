import { MigrationInterface, QueryRunner } from 'typeorm';

export class userUpdate1664809391557 implements MigrationInterface {
  name = 'userUpdate1664809391557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "login_history" DROP CONSTRAINT "FK_911ecf99e0f1a95668fea7cd6d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_history" ADD CONSTRAINT "FK_911ecf99e0f1a95668fea7cd6d8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "login_history" DROP CONSTRAINT "FK_911ecf99e0f1a95668fea7cd6d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_history" ADD CONSTRAINT "FK_911ecf99e0f1a95668fea7cd6d8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
