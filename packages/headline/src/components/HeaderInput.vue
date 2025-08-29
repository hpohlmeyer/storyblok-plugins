<script lang="ts">
export const SEO_OPTIONS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
export type FieldData = { headline: string; seo: typeof SEO_OPTIONS[number] } | '';
</script>

<script setup lang="ts">
import { nextTick, ref, watch, defineModel, useTemplateRef, onMounted } from 'vue'
import { SbSelect, SbTextField } from '@storyblok/design-system'
import * as z from "zod";

const SHADOW_BOTTOM_SIZE = 17;
const DEFAULT_SEO_OPTION = 'h2' satisfies typeof SEO_OPTIONS[number];
const HEADLINE_OPTIONS = SEO_OPTIONS.map((value) => ({ label: value.toUpperCase(), value }));


const props = defineProps<{
  textLabel?: string;
  seoLabel?: string;
  seoDefault?: string;
}>();

const content = defineModel<FieldData>({ required: true });

function validateSeoOptions(value: unknown) {
  const parsed = z.enum(SEO_OPTIONS).safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_SEO_OPTION;
}

// Use separate refs for the input fields, because the
// storyblok component typings are bad.
// const content = plugin.data?.content;
const headline = ref(content.value ? content.value.headline : '');
const seoFallback = validateSeoOptions(props.seoDefault);
const seo = ref<typeof SEO_OPTIONS[number]>(content.value ? content.value.seo : seoFallback);
const isOpen = ref<any>(false);

// Construct the plugin content, whenever headline or seo change
watch([headline, seo], ([headline, seo]) => {
  content.value = headline === '' ? '' : { headline, seo };
});

// Set the wrapper element to the document size whenever the select opens.
// The select will grow the scroll-height, but storyblok does not detect the
// size change and the select panel will get cut off.
// By setting the element size to be big enough to fit the select, we can
// make storyblok detect the changes and adjust the iframe height accordingly.
const height = ref(document.body.scrollHeight);
watch([isOpen], () => {
  nextTick(() => height.value = document.body.scrollHeight)
});

// The auto-grow property on the SbTextField does not take the border
// into account, which results in a 2px scrollbar that is always present.
// Because of that we implement the growing logic ourselves.
const textarea = useTemplateRef<typeof SbTextField>('textarea');
function resizeTextArea() {
  if (CSS.supports('field-sizing: content')) {
    // Use native field sizing if available
    return;
  }

  const field = textarea.value?.$refs.textfield;
  if (!(field instanceof HTMLTextAreaElement)) return;

  field.style.height = 'auto'
  const { borderWidth } = getComputedStyle(field);
  field.style.height = field.scrollHeight + (parseFloat(borderWidth) * 2) + 'px'
}

onMounted(() => {
  // Make sure stylesheets have been loaded before
  // measuring the text area.
  document.addEventListener('load', resizeTextArea, { once: true })
})
</script>

<template>
  <div className="headline-wrapper" :style="isOpen ? `min-height: ${height + SHADOW_BOTTOM_SIZE}px` : undefined">
    <SbTextField ref="textarea" type="textarea" @input="resizeTextArea" :rows="1" id="headline-input"
      v-model="headline" />
    <label for="headline-input">{{ props.textLabel || "Text" }}</label>
    <SbSelect @show="isOpen = true" @hide="isOpen = false" input-id="seo-input" v-model="seo"
      :options="HEADLINE_OPTIONS" />
    <label for="seo-input">{{ props.seoLabel || "SEO" }}</label>
  </div>
</template>

<style scoped>
label {
  word-break: break-word;
  display: block;
  color: #636F81;
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
  grid-template-columns: 1fr 9rem;
  grid-template-rows: auto auto;
  gap: 1rem;
  grid-auto-flow: column;
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