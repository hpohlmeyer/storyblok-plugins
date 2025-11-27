import { ref, watch, MaybeRefOrGetter, toValue, isRef } from 'vue'
import {
  DEFAULT_ELEMENT_VALUE,
  STYLE_INPUT_VALUES,
  StyleOption,
} from './constants'
import { validateElementValue, validateStyleInputValue } from './validators'

type DetermineElementValueArgs = {
  /** The value from the underlying data model */
  contentValue?: string
  /** The default value configured in the plugin options */
  defaultValue?: string
}

export function determineElementValue(args: DetermineElementValueArgs) {
  const contentValue = validateElementValue(args.contentValue)
  if (contentValue.success) return contentValue.data

  const defaultVal = validateElementValue(args.defaultValue)
  if (defaultVal.success) return defaultVal.data

  return DEFAULT_ELEMENT_VALUE
}

type UseElementValueArgs = {
  /** The value from the underlying data model */
  contentValue: MaybeRefOrGetter<string | undefined>
  /** The default value configured in the plugin options */
  defaultValue: MaybeRefOrGetter<string | undefined>
}

export function useElementValue(args: UseElementValueArgs) {
  return ref(
    determineElementValue({
      contentValue: toValue(args.contentValue),
      defaultValue: toValue(args.contentValue),
    }),
  )
}

type DetermineStyleValueArgs = {
  /** The value from the underlying data model */
  contentValue?: string
  /** The allowed options configured in the plugin options, but parsed into an array */
  allowedValues: Array<StyleOption>
}
export function determineStyleValue(args: DetermineStyleValueArgs) {
  const allowedInputValues = args.allowedValues
    ? ['default' as const, ...args.allowedValues]
    : STYLE_INPUT_VALUES
  const contentVal = validateStyleInputValue(
    args.contentValue,
    allowedInputValues,
  )
  if (contentVal.success) return contentVal.data

  return 'default'
}

type UseStyleValueArgs = {
  /** The value from the underlying data model */
  contentValue: MaybeRefOrGetter<string | undefined>
  /** The allowed options configured in the plugin options, but parsed into an array */
  allowedValues: MaybeRefOrGetter<Array<StyleOption>>
}

export function useStyleValue(args: UseStyleValueArgs) {
  const value = ref(
    determineStyleValue({
      contentValue: toValue(args.contentValue),
      allowedValues: toValue(args.allowedValues),
    }),
  )

  if (isRef(args.allowedValues)) {
    watch(args.allowedValues, (allowedValues) => {
      const newValue = determineStyleValue({
        contentValue: value.value,
        allowedValues: toValue(allowedValues),
      })
      value.value = newValue
    })
  }

  return value
}
