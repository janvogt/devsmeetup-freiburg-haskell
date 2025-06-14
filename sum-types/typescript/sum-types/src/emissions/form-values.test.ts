import {
  makeEmitter,
} from "./emission-source";
import { getInitialFormValues } from "./form-values";
import { EMISSION_FACTOR_TABLE } from "./emission-factors";

describe("getInitialFormValues() sets all the form default values", () => {
  test("a simple emitter with emission factor taken from database", () => {
    const simpleEmitter = makeEmitter({
      emitterId: "ELECTRICITY_GERMANY",
      description: "Some Utility Company",
      quantity: { value: 9001, uncertainty: 10 },
    });

    expect(getInitialFormValues(simpleEmitter, EMISSION_FACTOR_TABLE)).toEqual({
      description: "Some Utility Company",
      emitterId: "ELECTRICITY_GERMANY",
      quantity: "9001",
      quantityUncertainty: 10,

      // values computed from input
      factorMode: "database",
      factor: "0.4",
      factorUncertainty: 30,
      emissions: "3.6004",
      emissionsUncertainty: 30,

      enterEmissionsManually: false,
    });
  });

  test("a emitter with completely manually entered emissions", () => {
    const manualEmitter = makeEmitter({
      description: "Manually estimated GHG emissions",
      emissions: { value: 50_000, uncertainty: 20 },
    });

    expect(getInitialFormValues(manualEmitter, EMISSION_FACTOR_TABLE)).toEqual({
      description: "Manually estimated GHG emissions",
      enterEmissionsManually: true,
      emissions: "50000",
      emissionsUncertainty: 20,

      // values "computed" from input
      emitterId: undefined,
      factorMode: undefined,
      factor: undefined,
      factorUncertainty: 30,
      quantity: undefined,
      quantityUncertainty: 30,
    });
  });

  test("a emitter with known quantity and emission factor not from database", () => {
    const manualEmitter = makeEmitter({
      description: "Product from supplier",
      quantity: { value: 100, uncertainty: 0 },
      factor: { value: 0.5, uncertainty: 5 },
    });

    expect(getInitialFormValues(manualEmitter, EMISSION_FACTOR_TABLE)).toEqual({
      description: "Product from supplier",
      quantity: "100",
      quantityUncertainty: 0,
      factorMode: "manual",
      factor: "0.5",
      factorUncertainty: 5,

      // values computed from input
      emissions: "0.05",
      emissionsUncertainty: 30,

      enterEmissionsManually: false,
      emitterId: undefined,
    });
  });
});
