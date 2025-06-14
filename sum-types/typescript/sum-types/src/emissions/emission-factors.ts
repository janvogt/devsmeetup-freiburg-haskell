export const EMISSION_FACTOR_TABLE = {
  ELECTRICITY_GERMANY: 0.4,
  NATURAL_GAS: 0.2,
} as const;
export type EmissionFactors = typeof EMISSION_FACTOR_TABLE;

export function getFactorFromDatabase(
  factors: EmissionFactors,
  emitterId: string,
): number | undefined {
  return factors[emitterId as keyof EmissionFactors];
}
