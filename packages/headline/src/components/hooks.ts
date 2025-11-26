import { ref, watch, MaybeRefOrGetter, toValue, isRef } from "vue";
import { DEFAULT_ELEMENT_VALUE, ElementOption, STYLE_INPUT_VALUES, StyleOption } from "./constants";
import { validateElementValue, validateStyleInputValue, validateStyleValue } from "./validators";

type UseSeoValueArgs = {
  /** The value from the underlying datamodel */
  contentValue?: string;
  /** The default value configured in the plugin options */
  defaultValue?: string;
}

export function getInitialSeoValue(args: UseSeoValueArgs) {
  const contentValue = validateElementValue(args.contentValue);
  if (contentValue.success) return contentValue.data;

  const defaultVal = validateElementValue(args.defaultValue);
  if (defaultVal.success) return defaultVal.data;

  return DEFAULT_ELEMENT_VALUE;
}

type UseElementValueArgs = {
  /** The value from the underlying datamodel */
  contentValue: MaybeRefOrGetter<string | undefined>;
  /** The default value configured in the plugin options */
  defaultValue: MaybeRefOrGetter<string | undefined>;
}

export function useElementValue(args: UseElementValueArgs) {
  return ref(getInitialSeoValue({
    contentValue: toValue(args.contentValue),
    defaultValue: toValue(args.contentValue),
  }))
}

type GetStyleValueArgs = {
  /** The value from the underlying datamodel */
  contentValue?: string;
  /** The default value configured in the plugin options */
  defaultValue?: string;
  /** The allowed options configured in the plugin options, but parsed into an array */
  allowedValues: Array<StyleOption>;
  /** The current valid seo option */
  seoValue: ElementOption;
}
export function getInitialStyleValue(args: GetStyleValueArgs) {
    const allowedInputValues = args.allowedValues ? ['default' as const, ...args.allowedValues] : STYLE_INPUT_VALUES;
    const contentVal = validateStyleInputValue(args.contentValue, allowedInputValues);
    if (contentVal.success) return contentVal.data;
  
    const defaultVal = validateStyleValue(args.defaultValue, args.allowedValues);
    if (defaultVal.success) return "default";
    
    const seoVal = validateStyleValue(args.seoValue, args.allowedValues);
    if (seoVal.success) return seoVal.data;
  
    const fallbackValue = args.allowedValues.at(-1);
    if (fallbackValue) return fallbackValue;
    
    throw new Error(`Could no generate a sensible fallback value for the style input`);
  }

type UseStyleValueArgs = {
  /** The value from the underlying datamodel */
  contentValue: MaybeRefOrGetter<string | undefined>;
  /** The default value configured in the plugin options */
  defaultValue: MaybeRefOrGetter<string | undefined>;
  /** The allowed options configured in the plugin options, but parsed into an array */
  allowedValues: MaybeRefOrGetter<Array<StyleOption>>;
  /** The current valid seo option */
  seoValue: MaybeRefOrGetter<ElementOption>;
}

export function useStyleValue(args: UseStyleValueArgs) {
  const value = ref(getInitialStyleValue({
    contentValue: toValue(args.contentValue),
    defaultValue: toValue(args.defaultValue),
    allowedValues: toValue(args.allowedValues),
    seoValue: toValue(args.seoValue),
  }));

  if (isRef(args.allowedValues)) {
    watch(args.allowedValues, (all) => {
      const newValue = getInitialStyleValue({
        contentValue: value.value,
        defaultValue: toValue(args.defaultValue),
        allowedValues: toValue(args.allowedValues),
        seoValue: toValue(args.seoValue),
      })
      value.value = newValue;
    })
  }

  return value;
}
