import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1667081188152 implements MigrationInterface {
    name = 'migration1667081188152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "signupToken"`);
        await queryRunner.query(`CREATE TYPE "public"."user_signuptype_enum" AS ENUM('password', 'provider')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "signUpType" "public"."user_signuptype_enum" NOT NULL DEFAULT 'password'`);
        await queryRunner.query(`CREATE TYPE "public"."user_providername_enum" AS ENUM('google', 'facebook', 'github', 'bitbucket')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "providerName" "public"."user_providername_enum" NOT NULL DEFAULT 'google'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "providerName"`);
        await queryRunner.query(`DROP TYPE "public"."user_providername_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "signUpType"`);
        await queryRunner.query(`DROP TYPE "public"."user_signuptype_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "signupToken" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_84f67c49f832f13e682ba6839f4" UNIQUE ("signupToken")`);
    }

}
