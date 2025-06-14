import { Emitter, makeEmitter } from "./emitter";
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

export function emitterFromFormValues(formValues: EmitterFormValues) {
  return makeEmitter({
    description: formValues.description,
    emitterId: formValues.emitterId,
    quantity:
      formValues.quantity && formValues.quantityUncertainty != null
        ? {
            value: Number(formValues.quantity),
            uncertainty: formValues.quantityUncertainty,
          }
        : undefined,
    emissions:
      formValues.enterEmissionsManually &&
      formValues.emissions &&
      formValues.emissionsUncertainty != null
        ? {
            value: Number(formValues.emissions),
            uncertainty: formValues.emissionsUncertainty,
          }
        : undefined,
    factor:
      formValues.factorMode === "manual" &&
      formValues.factor &&
      formValues.factorUncertainty != null
        ? {
            value: Number(formValues.factor),
            uncertainty: formValues.factorUncertainty,
          }
        : undefined,
  });
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
