import { Emitter } from "./emission-source";
import { EmissionFactors, getFactorFromDatabase } from "./emission-factors";

export type EmitterFormValues = {
  description: string;
  quantity?: string;
  quantityUncertainty?: number;
  emitterId?: keyof EmissionFactors;
  factor?: string;
  factorUncertainty?: number;
  factorMode: "manual" | "database";
  enterEmissionsManually: boolean;
  emissions?: string;
  emissionsUncertainty?: number;
};

export function getInitialFormValues(
  emitter: Emitter,
  factors: EmissionFactors,
): Partial<EmitterFormValues> {
  let valuesFromEmitter: Partial<EmitterFormValues> = {
    description: emitter.description,
    emitterId: Object.keys(factors).includes(emitter.emitterId)
      ? (emitter.emitterId as keyof EmissionFactors)
      : undefined,
    quantity: emitter.quantity?.value.toString(),
    quantityUncertainty: emitter.quantity?.uncertainty ?? 30,
    emissionsUncertainty: emitter.emissions?.uncertainty ?? 30,
    factorUncertainty: emitter.factor?.uncertainty ?? 30,
  };
  if (emitter.emissions != null) {
    // manual mode, emissions are entered directly
    valuesFromEmitter = {
      ...valuesFromEmitter,
      enterEmissionsManually: true,
      emissions: emitter.emissions?.value.toString(),
    };
  } else {
    valuesFromEmitter = {
      ...valuesFromEmitter,
      factorMode: emitter.factor == null ? "database" : "manual",
      factor:
        emitter.factor?.value.toString() ??
        getFactorFromDatabase(factors, emitter.emitterId)?.toString(),
      enterEmissionsManually: false,
      emissions: calculateEmissionsInTons(
        emitter.quantity?.value,
        emitter.factor?.value,
        factors,
        emitter.emitterId,
      ).toString(),
    };
  }

  return valuesFromEmitter;
}

function calculateEmissionsInTons(
  quantity?: number,
  factor?: number,
  factorsFromDatabase?: EmissionFactors,
  emitterId?: string,
): number {
  if (quantity && factor) {
    return (quantity * factor) / 1000;
  } else if (
    quantity &&
    factorsFromDatabase &&
    emitterId &&
    getFactorFromDatabase(factorsFromDatabase, emitterId)
  ) {
    return (
      (quantity * getFactorFromDatabase(factorsFromDatabase, emitterId)!) / 1000
    );
  } else {
    return 0;
  }
}
