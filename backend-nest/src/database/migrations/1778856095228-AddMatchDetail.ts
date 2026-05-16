import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMatchDetail1778856095228 implements MigrationInterface {
    name = 'AddMatchDetail1778856095228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "match_stats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "match_id" uuid NOT NULL, "team_id" uuid NOT NULL, "possession" integer NOT NULL DEFAULT '0', "shots" integer NOT NULL DEFAULT '0', "shots_on_target" integer NOT NULL DEFAULT '0', "corners" integer NOT NULL DEFAULT '0', "fouls" integer NOT NULL DEFAULT '0', "offsides" integer NOT NULL DEFAULT '0', "saves" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c773744b8dae4efbbf72d4b486c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_match_stats_team" ON "match_stats" ("match_id", "team_id") `);
        await queryRunner.query(`CREATE TYPE "public"."match_lineups_position_enum" AS ENUM('GK', 'DEF', 'MID', 'FWD')`);
        await queryRunner.query(`CREATE TABLE "match_lineups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "match_id" uuid NOT NULL, "team_id" uuid NOT NULL, "player_id" uuid NOT NULL, "shirt_number" integer NOT NULL, "position" "public"."match_lineups_position_enum" NOT NULL, "is_starter" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_79de52f107f93cca28a6929329c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_match_lineup_shirt" ON "match_lineups" ("match_id", "team_id", "shirt_number") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_match_lineup_player" ON "match_lineups" ("match_id", "team_id", "player_id") `);
        await queryRunner.query(`CREATE TYPE "public"."match_events_type_enum" AS ENUM('GOAL', 'OWN_GOAL', 'PENALTY_GOAL', 'MISSED_PENALTY', 'YELLOW_CARD', 'RED_CARD', 'SECOND_YELLOW', 'SUBSTITUTION')`);
        await queryRunner.query(`CREATE TABLE "match_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "match_id" uuid NOT NULL, "type" "public"."match_events_type_enum" NOT NULL, "minute" integer NOT NULL, "added_minute" integer, "team_id" uuid NOT NULL, "player_id" uuid NOT NULL, "related_player_id" uuid, "notes" character varying(200), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_34160ac79fb420bdc42a6b24854" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "matches" ADD "home_formation" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "matches" ADD "away_formation" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "match_stats" ADD CONSTRAINT "FK_158a174fe7d42d7b07bd3f71583" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_stats" ADD CONSTRAINT "FK_3c811e3c05fd2536bfc0ad43e23" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_lineups" ADD CONSTRAINT "FK_90df5204130ca28c11c4b089fde" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_lineups" ADD CONSTRAINT "FK_c38be231728808d04763e11fd73" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_lineups" ADD CONSTRAINT "FK_089aed8a6f8c4b1f0ba8deeef9b" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_events" ADD CONSTRAINT "FK_5bd1e02201ebf85de3ba5b70a83" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_events" ADD CONSTRAINT "FK_57fdadec2ad1ce3e3cdfaff023b" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_events" ADD CONSTRAINT "FK_482e23aeaaa3485fdb0b573f8ec" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_events" ADD CONSTRAINT "FK_e74afc5e8cbd14c3adef3e96cef" FOREIGN KEY ("related_player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_events" DROP CONSTRAINT "FK_e74afc5e8cbd14c3adef3e96cef"`);
        await queryRunner.query(`ALTER TABLE "match_events" DROP CONSTRAINT "FK_482e23aeaaa3485fdb0b573f8ec"`);
        await queryRunner.query(`ALTER TABLE "match_events" DROP CONSTRAINT "FK_57fdadec2ad1ce3e3cdfaff023b"`);
        await queryRunner.query(`ALTER TABLE "match_events" DROP CONSTRAINT "FK_5bd1e02201ebf85de3ba5b70a83"`);
        await queryRunner.query(`ALTER TABLE "match_lineups" DROP CONSTRAINT "FK_089aed8a6f8c4b1f0ba8deeef9b"`);
        await queryRunner.query(`ALTER TABLE "match_lineups" DROP CONSTRAINT "FK_c38be231728808d04763e11fd73"`);
        await queryRunner.query(`ALTER TABLE "match_lineups" DROP CONSTRAINT "FK_90df5204130ca28c11c4b089fde"`);
        await queryRunner.query(`ALTER TABLE "match_stats" DROP CONSTRAINT "FK_3c811e3c05fd2536bfc0ad43e23"`);
        await queryRunner.query(`ALTER TABLE "match_stats" DROP CONSTRAINT "FK_158a174fe7d42d7b07bd3f71583"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "away_formation"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "home_formation"`);
        await queryRunner.query(`DROP TABLE "match_events"`);
        await queryRunner.query(`DROP TYPE "public"."match_events_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_match_lineup_player"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_match_lineup_shirt"`);
        await queryRunner.query(`DROP TABLE "match_lineups"`);
        await queryRunner.query(`DROP TYPE "public"."match_lineups_position_enum"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_match_stats_team"`);
        await queryRunner.query(`DROP TABLE "match_stats"`);
    }

}
