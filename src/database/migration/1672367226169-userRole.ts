import { MigrationInterface, QueryRunner } from "typeorm";

export class userRole1672367226169 implements MigrationInterface {
    name = 'userRole1672367226169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_user_role_enum" AS ENUM('user', 'admin', 'super')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "user_role" "public"."user_user_role_enum" NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_role"`);
        await queryRunner.query(`DROP TYPE "public"."user_user_role_enum"`);
    }

}
