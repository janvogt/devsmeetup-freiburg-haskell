export type ValueWithUncertainty = Readonly<{ value: number; uncertainty: number }>;

export type Emitter = {
    description: string;
    getEmissions: (emitterFactors: any) => number;
    getUncertaintyOfEmissions: () => number;
} & EmitterOptions;

export type EmitterOptions = {
    assignee?: string;
    quantity?: ValueWithUncertainty;
    factor?: ValueWithUncertainty;
    emissions?: ValueWithUncertainty;
};


export type EmitterFormValues = {
    description: string;
    assignee?: string;
    category: string;
    quantity?: string;
    quantityUncertainty?: number;
    factor?: string;
    factorUncertainty?: number;
    factorMode: "manual" | "database";
    enterEmissionsManually: boolean;
    emissions?: string;
    emissionsUncertainty?: number;
};



export function getInitialFormValues(
    emitter: Emitter,
    factors: EmitterFactors
): Partial<EmitterFormValues> {
    let valuesFromEmitter: Partial<EmitterFormValues> = {};

    valuesFromEmitter = {
        description: emitter.description,
        assignee: emitter.assignee,
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
            factor: emitter.factor?.value.toString() ?? getFactorFromDatabase(factors, emitter.emitterId),
            enterEmissionsManually: false,
            emissions: calculateEmissionsInTons(
                emitter.quantity?.value,
                emitter.factor?.value,
                factors,
                emitter.emitterId
            ).toString(),
        };
    }

    return valuesFromEmitter;
}