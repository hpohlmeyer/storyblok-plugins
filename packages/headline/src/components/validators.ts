import z from "zod";
import { ELEMENT_VALUES, STYLE_INPUT_VALUES, STYLE_VALUES, StyleInputOption, StyleOption } from "./constants";

export function parseAllowedStyleInputValues(value: unknown) {
  return z.string()
      .min(1)
      .transform((value) => value.split(/\s?,\s?/))
      .pipe(z.array(z.enum(STYLE_INPUT_VALUES)).min(1))
      .catch(STYLE_INPUT_VALUES)
      .parse(value);
}

export function parseAllowedStyleValues(value: unknown) {
  return z.string()
      .min(1)
      .transform((value) => value.split(/\s?,\s?/))
      .pipe(z.array(z.enum(STYLE_VALUES)).min(1))
      .catch(STYLE_VALUES)
      .parse(value);
}

export function validateStyleInputValue(value: unknown, allowedValues: Array<StyleInputOption>) {
  return z.enum(allowedValues).safeParse(value);
}

export function validateStyleValue(value: unknown, allowedValues: Array<StyleOption>) {
  return z.enum(allowedValues).safeParse(value);
}

export function validateElementValue(value: unknown) {
  return z
    .enum(ELEMENT_VALUES)
    .safeParse(value);
}