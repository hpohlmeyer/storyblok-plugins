<script setup lang="ts">
import {
  nextTick,
  ref,
  watch,
  useTemplateRef,
  onMounted,
  toRef,
  computed,
  watchEffect,
} from 'vue'
import { SbSelect, SbTextField } from '@storyblok/design-system'
import { useElementValue, useStyleValue } from './hooks'
import {
  ELEMENT_OPTIONS,
  FieldData,
  SHADOW_BOTTOM_SIZE,
  STYLE_OPTIONS,
} from './constants'
import { parseAllowedStyleValues, validateStyleValue } from './validators'

const props = defineProps<{
  textLabel?: string
  styleLabel?: string
  styleAllowed?: string
  styleDefault?: string
  seoLabel?: string
  seoDefault?: string
  styleShown?: boolean
}>()

const content = defineModel<FieldData>({ required: true })
const text = ref(content.value ? content.value.text : '')

const element = useElementValue({
  contentValue: content.value ? content.value.element : undefined,
  defaultValue: toRef(props.seoDefault),
})

const allowedStyleValues = computed(() =>
  parseAllowedStyleValues(props.styleAllowed),
)
const allowedStyleOptions = computed(() =>
  STYLE_OPTIONS.filter(({ value }) => {
    return value === 'default' || allowedStyleValues.value.includes(value)
  }),
)

const styleIsOpen = ref(false)
const styleShown = toRef(props, 'styleShown')
const style = useStyleValue({
  contentValue: toRef(content.value ? content.value.style : undefined),
  allowedValues: allowedStyleValues,
})

const elementIsOpen = ref(false)

// Construct the plugin state
watchEffect(() => {
  if (text.value === '') {
    return (content.value = '')
  }

  const nextValue: FieldData = {
    text: text.value,
    element: element.value,
  }

  if (props.styleShown) {
    if (style.value === 'default') {
      // If a valid default option is set, use that, otherwise fall back to the component default
      const defaultValue = validateStyleValue(
        props.styleDefault,
        allowedStyleValues.value,
      )
      if (defaultValue.success) nextValue.style = defaultValue.data
    } else {
      // If a valid default option is set, use that, otherwise fall back to the component default
      nextValue.style = style.value
    }
  }

  content.value = nextValue
})

// Set the wrapper element to the document size whenever the select opens.
// The select will grow the scroll-height, but storyblok does not detect the
// size change and the select panel will get cut off.
// By setting the element size to be big enough to fit the select, we can
// make storyblok detect the changes and adjust the iframe height accordingly.
const height = ref(document.body.scrollHeight)
watch([elementIsOpen, styleIsOpen], () => {
  nextTick(() => (height.value = document.body.scrollHeight))
})

// The auto-grow property on the SbTextField does not take the border
// into account, which results in a 2px scrollbar that is always present.
// Because of that we implement the growing logic ourselves.
const textarea = useTemplateRef<typeof SbTextField>('textarea')
function resizeTextArea() {
  if (CSS.supports('field-sizing: content')) {
    // Use native field sizing if available
    return
  }

  const field = textarea.value?.$refs.textfield
  if (!(field instanceof HTMLTextAreaElement)) return

  field.style.height = 'auto'
  const { borderWidth } = getComputedStyle(field)
  field.style.height = field.scrollHeight + parseFloat(borderWidth) * 2 + 'px'
}

onMounted(() => {
  // Make sure stylesheets have been loaded before
  // measuring the text area.
  document.addEventListener('load', resizeTextArea, { once: true })
})

const wrapperVariant = computed(() =>
  props.styleShown ? 'headline-wrapper--wrap' : 'headline-wrapper--nowrap',
)
</script>

<template>
  <div
    :className="`headline-wrapper ${wrapperVariant}`"
    :style="
      elementIsOpen || styleIsOpen
        ? `min-height: ${height + SHADOW_BOTTOM_SIZE}px`
        : undefined
    "
  >
    <SbTextField
      class="text-input"
      ref="textarea"
      type="textarea"
      @input="resizeTextArea"
      :rows="1"
      id="text-input"
      v-model="text"
    />
    <label
      class="text-input__label"
      for="text-input"
      >{{ props.textLabel || 'Text' }}</label
    >
    <template v-if="styleShown">
      <SbSelect
        class="style-input"
        @show="styleIsOpen = true"
        @hide="styleIsOpen = false"
        input-id="style-input"
        v-model="style"
        :options="allowedStyleOptions"
      />
      <label
        class="style-input__label"
        for="style-input"
        >{{ props.styleLabel || 'Style' }}</label
      >
    </template>
    <SbSelect
      class="element-input"
      @show="elementIsOpen = true"
      @hide="elementIsOpen = false"
      input-id="element-input"
      v-model="element"
      :options="ELEMENT_OPTIONS"
    />
    <label
      class="element-input__label"
      for="element-input"
      >{{ props.seoLabel || 'SEO' }}</label
    >
  </div>
</template>

<style scoped>
label {
  word-break: break-word;
  display: block;
  color: #636f81;
  font-size: 1.2rem;
  line-height: 1.2;
}

.headline-wrapper:deep(.sb-select-list) {
  min-width: unset;
}

.headline-wrapper:deep(.sb-select__input--hidden) {
  max-width: 100%;
  padding: 0;
}

.headline-wrapper {
  display: grid;
  align-content: start;
  gap: 1rem;
  grid-auto-flow: column;
}

.headline-wrapper--nowrap {
  grid-template-columns: minmax(0, 1fr) 9rem;
  grid-template-rows: auto auto;
}

.headline-wrapper--wrap {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto auto;

  .text-input,
  .text-input__label {
    grid-column: 1 / -1;
  }
}

.headline-wrapper:deep(.sb-textfield__textarea) {
  min-height: unset;
  height: auto;
  resize: none;

  /* Use native field-resizing if available */
  field-sizing: content;

  /* Overwrites the `.uk-form textarea` class injected by storyblok in the CMS. */
  /* It conflicts with their design-system style reset. */
  font-size: 1.4rem !important;
}
</style>
