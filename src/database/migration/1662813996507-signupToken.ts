import { MigrationInterface, QueryRunner } from "typeorm";

export class signupToken1662813996507 implements MigrationInterface {
    name = 'signupToken1662813996507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "signupToken" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4" UNIQUE ("signupToken")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "signupToken"`);
    }

}
