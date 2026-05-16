import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlayers1778851028286 implements MigrationInterface {
    name = 'AddPlayers1778851028286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."players_document_type_enum" AS ENUM('DNI', 'CE', 'PASAPORTE', 'RUC')`);
        await queryRunner.query(`CREATE TYPE "public"."players_position_enum" AS ENUM('GK', 'DEF', 'MID', 'FWD')`);
        await queryRunner.query(`CREATE TYPE "public"."players_preferred_foot_enum" AS ENUM('LEFT', 'RIGHT', 'BOTH')`);
        await queryRunner.query(`CREATE TABLE "players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "document_type" "public"."players_document_type_enum" NOT NULL, "document_number" character varying NOT NULL, "birth_date" date NOT NULL, "position" "public"."players_position_enum" NOT NULL, "preferred_foot" "public"."players_preferred_foot_enum", "nationality" character varying(60), "photo_url" character varying, "photo_public_id" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_player_document" ON "players" ("document_type", "document_number") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_player_document"`);
        await queryRunner.query(`DROP TABLE "players"`);
        await queryRunner.query(`DROP TYPE "public"."players_preferred_foot_enum"`);
        await queryRunner.query(`DROP TYPE "public"."players_position_enum"`);
        await queryRunner.query(`DROP TYPE "public"."players_document_type_enum"`);
    }

}
