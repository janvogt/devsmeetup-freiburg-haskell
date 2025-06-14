export type ValueWithUncertainty = Readonly<{
  value: number;
  uncertainty: number;
}>;

export const EMISSION_FACTOR_TABLE = {
  ELECTRICITY_GERMANY: 0.4,
  NATURAL_GAS: 0.2,
} as const;

type EmitterFactors = typeof EMISSION_FACTOR_TABLE;

function getFactorFromDatabase(
  factors: EmitterFactors,
  emitterId: string,
): number | undefined {
  return factors[emitterId as keyof EmitterFactors];
}

export function calculateEmissionsInTons(
  quantity?: number,
  factor?: number,
  factorsFromDatabase?: EmitterFactors,
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

export type Emitter = {
  description: string;
  emitterId?: string;
  quantity?: ValueWithUncertainty;
  factor?: ValueWithUncertainty;
  emissions?: ValueWithUncertainty;
  getEmissions: (emitterFactors: EmitterFactors) => number;
  getUncertaintyOfEmissions: () => number;
};

export function makeEmitter(
  options: Omit<Emitter, "getEmissions" | "getUncertaintyOfEmissions">,
): Emitter {
  function getFactor(emitterFactors: EmitterFactors): number | undefined {
    if (Number.isFinite(options?.factor?.value)) {
      return options?.factor?.value;
    } else if (options?.emitterId) {
      return emitterFactors[options?.emitterId]?.factor;
    } else {
      return undefined;
    }
  }

  return {
    ...options,
    getEmissions(emitterFactors) {
      if (options?.emissions != null) {
        return options.emissions.value;
      }
      if (options?.quantity == null) {
        return 0;
      }

      const factor = getFactor(emitterFactors);
      if (factor == null) {
        return 0;
      }

      return (factor * options.quantity.value) / 1000;
    },
    getUncertaintyOfEmissions() {
      if (options?.emissions != null) {
        return options.emissions.uncertainty;
      }

      if (options?.quantity != null && options?.factor != null) {
        return Math.sqrt(
          Math.pow(Number(options?.quantity?.uncertainty), 2) +
            Math.pow(Number(options?.factor?.uncertainty), 2),
        );
      }

      return 60;
    },
  };
}

export type EmitterFormValues = {
  description: string;
  quantity?: string;
  quantityUncertainty?: number;
  emitterId?: keyof EmitterFactors;
  factor?: string;
  factorUncertainty?: number;
  factorMode: "manual" | "database";
  enterEmissionsManually: boolean;
  emissions?: string;
  emissionsUncertainty?: number;
};

export function getInitialFormValues(
  emitter: Emitter,
  factors: EmitterFactors,
): Partial<EmitterFormValues> {

  let valuesFromEmitter: Partial<EmitterFormValues> = {
    description: emitter.description,
    emitterId: Object.keys(factors).includes(emitter.emitterId) ? emitter.emitterId as keyof EmitterFactors : undefined,
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
