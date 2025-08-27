<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import _FieldPlugin from './components/FieldPlugin.vue'
import { SbSelect, SbTextField } from '@storyblok/design-system'
import { useFieldPlugin } from '@storyblok/field-plugin/vue3'
import * as z from "zod";

const SHADOW_BOTTOM_SIZE = 17;
const SEO_OPTIONS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
const HEADLINE_OPTIONS = SEO_OPTIONS.map((value) => ({ label: value.toUpperCase(), value }));

const plugin = useFieldPlugin<{ headline: string; seo: typeof SEO_OPTIONS[number] } | ''>({
  // Validation is needed, because you could set an
  // invalid default value, when using the plugin.
  validateContent(content: unknown) {
    if (content === '') {
      return { content };
    }

    const parsed = z.object({
      headline: z.string().min(10),
      seo: z.enum(SEO_OPTIONS),
    }).safeParse(content);

    return parsed.success
      ? { content: parsed.data }
      : { content: '', error: z.prettifyError(parsed.error) };
  }
});

// Use separate refs for the input fields, because the
// storyblok component typings are bad.
const content = plugin.data?.content;
const headline = ref(content ? content.headline : '');
const seo = ref<typeof SEO_OPTIONS[number]>(content ? content.seo : 'h2');
const isOpen = ref<any>(false);

// Construct the plugin content, whenever headline or seo change
watch([headline, seo], ([headline, seo]) => {
  const content = headline === '' ? '' : { headline, seo };
  plugin.actions?.setContent(content);
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
</script>

<template>
  <div v-if="plugin.type === 'loaded'" className="headline-wrapper"
    :style="isOpen ? `min-height: ${height + SHADOW_BOTTOM_SIZE}px` : undefined">
    <SbTextField id="headline-input" v-model="headline" />
    <label for="headline-input">{{ plugin.data?.options.textLabel || "Text" }}</label>
    <SbSelect render-on-open @show="isOpen.value = true" @hide="isOpen.value = false" filterable input-id="seo-input"
      v-model="seo" :options="HEADLINE_OPTIONS" />
    <label for="seo-input">{{ plugin.data?.options.seoLabel || "SEO" }}</label>
  </div>
</template>

<style scoped>
label {
  color: #636F81;
  font-size: 1.2rem;
}

.headline-wrapper {
  display: grid;
  align-content: start;
  /* 176px is the min-width of the select panel */
  grid-template-columns: 1fr 176px;
  grid-template-rows: auto auto;
  gap: 1rem;
  grid-auto-flow: column;
}
</style>