<script setup lang="ts">
import { useFieldPlugin } from '@storyblok/field-plugin/vue3';
import HeaderInput, { type FieldData, SEO_OPTIONS } from './HeaderInput.vue';
import * as z from 'zod';

const plugin = useFieldPlugin<FieldData>({
  // Validation is needed, because you could set an
  // invalid default value, when using the plugin.
  validateContent(content: unknown) {
    if (content === '') {
      return { content };
    }

    const parsed = z.object({
      headline: z.string().min(1),
      seo: z.enum(SEO_OPTIONS),
    }).safeParse(content);

    return parsed.success
      ? { content: parsed.data }
      : { content: '', error: z.prettifyError(parsed.error) };
  }
});
</script>

<template>
  <template v-if="plugin.type === 'loaded'">
    <HeaderInput
      @update:model-value="(value) => plugin.actions?.setContent(value)"
      :model-value="plugin.data.content"
      :seo-default="plugin.data.options.seoDefault"
      :seo-label="plugin.data.options.seoLabel"
      :text-label="plugin.data.options.textLabel"
    />
  </template>
</template>