import { EmissionFactors } from "./emission-factors";

export type ValueWithUncertainty = Readonly<{
  value: number;
  uncertainty: number;
}>;

export type Emitter = {
  description: string;
  emitterId?: string;
  quantity?: ValueWithUncertainty;
  factor?: ValueWithUncertainty;
  emissions?: ValueWithUncertainty;
  getEmissions: (emitterFactors: EmissionFactors) => number;
  getUncertaintyOfEmissions: () => number;
};

export function makeEmitter(
  options: Omit<Emitter, "getEmissions" | "getUncertaintyOfEmissions">,
): Emitter {
  function getFactor(emitterFactors: EmissionFactors): number | undefined {
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
