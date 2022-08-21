import { MigrationInterface, QueryRunner } from 'typeorm';

export class userHistory1661073416034 implements MigrationInterface {
  name = 'userHistory1661073416034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "login_time" character varying, "country" character varying, "ip_address" character varying, "browser_name" character varying, "os_name" character varying, "userId" uuid, CONSTRAINT "PK_777252b9045d8011ab83c5b0834" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "history"`);
    await queryRunner.query(
      `ALTER TABLE "user_history" ADD CONSTRAINT "FK_1457ea6e3cbd29bf788292d0d15" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_history" DROP CONSTRAINT "FK_1457ea6e3cbd29bf788292d0d15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "history" jsonb DEFAULT '[]'`,
    );
    await queryRunner.query(`DROP TABLE "user_history"`);
  }
}
