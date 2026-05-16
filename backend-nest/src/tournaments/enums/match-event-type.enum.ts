export enum MatchEventType {
  GOAL = 'GOAL',
  OWN_GOAL = 'OWN_GOAL',
  PENALTY_GOAL = 'PENALTY_GOAL',
  MISSED_PENALTY = 'MISSED_PENALTY',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD',
  SECOND_YELLOW = 'SECOND_YELLOW',
  SUBSTITUTION = 'SUBSTITUTION',
}

export const SCORING_EVENTS: ReadonlySet<MatchEventType> = new Set([
  MatchEventType.GOAL,
  MatchEventType.OWN_GOAL,
  MatchEventType.PENALTY_GOAL,
]);
