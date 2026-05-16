import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFixture1778855159986 implements MigrationInterface {
    name = 'AddFixture1778855159986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."phases_type_enum" AS ENUM('LEAGUE', 'GROUP_STAGE', 'ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL', 'THIRD_PLACE')`);
        await queryRunner.query(`CREATE TABLE "phases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournament_id" uuid NOT NULL, "name" character varying(80) NOT NULL, "type" "public"."phases_type_enum" NOT NULL, "order" integer NOT NULL, "legs" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e93bb53460b28d4daf72735d5d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_phase_order" ON "phases" ("tournament_id", "order") `);
        await queryRunner.query(`CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phase_id" uuid NOT NULL, "name" character varying(20) NOT NULL, "capacity" integer NOT NULL DEFAULT '4', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_group_phase_name" ON "groups" ("phase_id", "name") `);
        await queryRunner.query(`CREATE TABLE "match_days" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phase_id" uuid NOT NULL, "number" integer NOT NULL, "date" date, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_51b24ecc65c1c93fe94cd997b19" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_matchday_phase_number" ON "match_days" ("phase_id", "number") `);
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum" AS ENUM('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournament_id" uuid NOT NULL, "phase_id" uuid NOT NULL, "group_id" uuid, "match_day_id" uuid, "home_team_id" uuid, "away_team_id" uuid, "parent_home_match_id" uuid, "parent_away_match_id" uuid, "bracket_round" integer, "bracket_position" integer, "kickoff" TIMESTAMP WITH TIME ZONE, "venue" character varying(120), "status" "public"."matches_status_enum" NOT NULL DEFAULT 'SCHEDULED', "home_score" integer, "away_score" integer, "home_penalties" integer, "away_penalties" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "group_id" uuid NOT NULL, "team_id" uuid NOT NULL, "seed" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2402283dc872c60d73c39dd051a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_group_team" ON "group_teams" ("group_id", "team_id") `);
        await queryRunner.query(`ALTER TABLE "phases" ADD CONSTRAINT "FK_38239acd04502fb5f883d2956a2" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_7169cf919d2209f56818f004511" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_days" ADD CONSTRAINT "FK_d97a85affd9d85fc9f7f41edc42" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_d0fb132a9b17b5801b916662147" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_4445c1b2bd39fe81088ea640acb" FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_24e8071e3486275a5a31912a87d" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_d71fc41fb09ef5ae9cd04cca7ca" FOREIGN KEY ("match_day_id") REFERENCES "match_days"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_bb25f11ea6fa78b344a68923769" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_e457f057d971e464c1ebf6378c5" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_teams" ADD CONSTRAINT "FK_6e9057760268c61106d216deae0" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_teams" ADD CONSTRAINT "FK_578cb7280cd7810fa10041d1ea8" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_teams" DROP CONSTRAINT "FK_578cb7280cd7810fa10041d1ea8"`);
        await queryRunner.query(`ALTER TABLE "group_teams" DROP CONSTRAINT "FK_6e9057760268c61106d216deae0"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_e457f057d971e464c1ebf6378c5"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_bb25f11ea6fa78b344a68923769"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_d71fc41fb09ef5ae9cd04cca7ca"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_24e8071e3486275a5a31912a87d"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_4445c1b2bd39fe81088ea640acb"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_d0fb132a9b17b5801b916662147"`);
        await queryRunner.query(`ALTER TABLE "match_days" DROP CONSTRAINT "FK_d97a85affd9d85fc9f7f41edc42"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_7169cf919d2209f56818f004511"`);
        await queryRunner.query(`ALTER TABLE "phases" DROP CONSTRAINT "FK_38239acd04502fb5f883d2956a2"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_group_team"`);
        await queryRunner.query(`DROP TABLE "group_teams"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_matchday_phase_number"`);
        await queryRunner.query(`DROP TABLE "match_days"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_group_phase_name"`);
        await queryRunner.query(`DROP TABLE "groups"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_phase_order"`);
        await queryRunner.query(`DROP TABLE "phases"`);
        await queryRunner.query(`DROP TYPE "public"."phases_type_enum"`);
    }

}
