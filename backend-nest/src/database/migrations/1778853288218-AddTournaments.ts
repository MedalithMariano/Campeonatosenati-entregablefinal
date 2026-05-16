import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTournaments1778853288218 implements MigrationInterface {
    name = 'AddTournaments1778853288218'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tournaments_format_enum" AS ENUM('LEAGUE', 'KNOCKOUT', 'GROUPS_KNOCKOUT')`);
        await queryRunner.query(`CREATE TYPE "public"."tournaments_status_enum" AS ENUM('DRAFT', 'REGISTRATION', 'IN_PROGRESS', 'FINISHED')`);
        await queryRunner.query(`CREATE TABLE "tournaments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "season" character varying(20) NOT NULL, "format" "public"."tournaments_format_enum" NOT NULL, "status" "public"."tournaments_status_enum" NOT NULL DEFAULT 'DRAFT', "points_win" integer NOT NULL DEFAULT '3', "points_draw" integer NOT NULL DEFAULT '1', "points_loss" integer NOT NULL DEFAULT '0', "min_players_per_roster" integer NOT NULL DEFAULT '11', "max_players_per_roster" integer NOT NULL DEFAULT '25', "start_date" date, "end_date" date, "description" text, "banner_url" character varying, "banner_public_id" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6d5d129da7a80cf99e8ad4833a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tournament_teams_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN')`);
        await queryRunner.query(`CREATE TABLE "tournament_teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournament_id" uuid NOT NULL, "team_id" uuid NOT NULL, "status" "public"."tournament_teams_status_enum" NOT NULL DEFAULT 'APPROVED', "group_id" uuid, "registered_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e5e9835d1cc7678bc6f8b9cb4cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_tournament_team" ON "tournament_teams" ("tournament_id", "team_id") `);
        await queryRunner.query(`CREATE TABLE "tournament_rosters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournament_id" uuid NOT NULL, "team_id" uuid NOT NULL, "player_id" uuid NOT NULL, "shirt_number" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_76c94226c6b33c344d0bd294ad7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_roster_player_per_tournament" ON "tournament_rosters" ("tournament_id", "player_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_roster_team_shirt" ON "tournament_rosters" ("tournament_id", "team_id", "shirt_number") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_roster_team_player" ON "tournament_rosters" ("tournament_id", "team_id", "player_id") `);
        await queryRunner.query(`ALTER TABLE "tournament_teams" ADD CONSTRAINT "FK_1a8faed6cf5e1669d40b3a8b762" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tournament_teams" ADD CONSTRAINT "FK_2e3297dc33a4087af1c1bf4c645" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tournament_rosters" ADD CONSTRAINT "FK_a678db615d1d2937386a3bf81a1" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tournament_rosters" ADD CONSTRAINT "FK_1da40d14fd1eae2f8a72386b3bd" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tournament_rosters" ADD CONSTRAINT "FK_c8cc236fdbd632713cea037667b" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tournament_rosters" DROP CONSTRAINT "FK_c8cc236fdbd632713cea037667b"`);
        await queryRunner.query(`ALTER TABLE "tournament_rosters" DROP CONSTRAINT "FK_1da40d14fd1eae2f8a72386b3bd"`);
        await queryRunner.query(`ALTER TABLE "tournament_rosters" DROP CONSTRAINT "FK_a678db615d1d2937386a3bf81a1"`);
        await queryRunner.query(`ALTER TABLE "tournament_teams" DROP CONSTRAINT "FK_2e3297dc33a4087af1c1bf4c645"`);
        await queryRunner.query(`ALTER TABLE "tournament_teams" DROP CONSTRAINT "FK_1a8faed6cf5e1669d40b3a8b762"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_roster_team_player"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_roster_team_shirt"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_roster_player_per_tournament"`);
        await queryRunner.query(`DROP TABLE "tournament_rosters"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_tournament_team"`);
        await queryRunner.query(`DROP TABLE "tournament_teams"`);
        await queryRunner.query(`DROP TYPE "public"."tournament_teams_status_enum"`);
        await queryRunner.query(`DROP TABLE "tournaments"`);
        await queryRunner.query(`DROP TYPE "public"."tournaments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tournaments_format_enum"`);
    }

}
