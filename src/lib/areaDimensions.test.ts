import { describe, it, expect } from "vitest";
import { displayDimensions } from "./areaDimensions";

describe("displayDimensions", () => {
  it("mantém dimensão curta e limpa", () => {
    expect(displayDimensions("15x35")).toBe("15x35");
    expect(displayDimensions(" 12x33,24 ")).toBe("12x33,24");
  });

  it("extrai a dimensão de blob HTML legado (cód 4684)", () => {
    const raw =
      "<p> <strong>&Aacute;rea do terreno: 398,94m&sup2; (12x33,24).</strong><br /> " +
      "<strong>&Aacute;rea Constru&iacute;da: 293,92m&sup2;.</strong><br /><br /> " +
      "<strong>Taxas: a consultar. </strong> </p>";
    expect(displayDimensions(raw)).toBe("12x33,24");
  });

  it("descarta blob HTML sem padrão NxM", () => {
    expect(displayDimensions("<p><strong>Taxas: a consultar.</strong></p>")).toBeUndefined();
  });

  it("descarta texto longo sem HTML e sem padrão NxM", () => {
    expect(displayDimensions("descrição longa do terreno sem medidas informadas aqui")).toBeUndefined();
  });

  it("extrai NxM de texto longo sem HTML", () => {
    expect(displayDimensions("terreno plano medindo 10,5 x 42 conforme matrícula, escriturado")).toBe("10,5x42");
  });

  it("descarta vazio/nulo/não-string", () => {
    expect(displayDimensions("")).toBeUndefined();
    expect(displayDimensions("   ")).toBeUndefined();
    expect(displayDimensions(null)).toBeUndefined();
    expect(displayDimensions(undefined)).toBeUndefined();
    expect(displayDimensions(42)).toBeUndefined();
  });
});
