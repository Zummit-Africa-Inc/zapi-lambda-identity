import { MigrationInterface, QueryRunner } from "typeorm";

export class otpFlow1663583699462 implements MigrationInterface {
    name = 'otpFlow1663583699462'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "signupToken" TO "userOTP"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4" TO "UQ_aa74a6955d6137c3877e833e22a"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "userOTP" TO "signupToken"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "UQ_aa74a6955d6137c3877e833e22a" TO "UQ_84f67c49f832f13e682ba6839f4"`);
        await queryRunner.query(`CREATE TABLE "login_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "login_time" character varying, "country" text, "ip_address" character varying, "browser_name" character varying, "os_name" character varying, "userId" uuid, CONSTRAINT "PK_fe377f36d49c39547cb6b9f0727" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "one_time_password" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedOn" TIMESTAMP, "updatedBy" character varying, "deletedOn" TIMESTAMP WITH TIME ZONE, "deletedBy" character varying, "otp" character varying, "signupToken" character varying, CONSTRAINT "UQ_baad3eb989ae49a5d39f93557f7" UNIQUE ("otp"), CONSTRAINT "UQ_8f618f813830eeec6cda9e976df" UNIQUE ("signupToken"), CONSTRAINT "PK_6aa80a21a6822be4a9d8b5c7d5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "signupToken"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "userOTP" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_aa74a6955d6137c3877e833e22a" UNIQUE ("userOTP")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "signupToken" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4" UNIQUE ("signupToken")`);
        await queryRunner.query(`ALTER TABLE "login_history" ADD CONSTRAINT "FK_911ecf99e0f1a95668fea7cd6d8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "login_history" DROP CONSTRAINT "FK_911ecf99e0f1a95668fea7cd6d8"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "signupToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_aa74a6955d6137c3877e833e22a"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "userOTP"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "signupToken" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4" UNIQUE ("signupToken")`);
        await queryRunner.query(`DROP TABLE "one_time_password"`);
        await queryRunner.query(`DROP TABLE "login_history"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4" TO "UQ_aa74a6955d6137c3877e833e22a"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "signupToken" TO "userOTP"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "UQ_aa74a6955d6137c3877e833e22a" TO "UQ_84f67c49f832f13e682ba6839f4"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "userOTP" TO "signupToken"`);
    }

}
