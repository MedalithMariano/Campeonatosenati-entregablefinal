export enum PhaseType {
  LEAGUE = 'LEAGUE',
  GROUP_STAGE = 'GROUP_STAGE',
  ROUND_OF_16 = 'ROUND_OF_16',
  QUARTERFINAL = 'QUARTERFINAL',
  SEMIFINAL = 'SEMIFINAL',
  FINAL = 'FINAL',
  THIRD_PLACE = 'THIRD_PLACE',
}

export const KNOCKOUT_PHASE_TYPES: ReadonlySet<PhaseType> = new Set([
  PhaseType.ROUND_OF_16,
  PhaseType.QUARTERFINAL,
  PhaseType.SEMIFINAL,
  PhaseType.FINAL,
  PhaseType.THIRD_PLACE,
]);
