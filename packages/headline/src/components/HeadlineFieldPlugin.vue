<script setup lang="ts">
import { useFieldPlugin } from '@storyblok/field-plugin/vue3'
import HeaderInput from './HeaderInput.vue'
import * as z from 'zod'
import { computed } from 'vue'
import { ELEMENT_VALUES, FieldData, STYLE_VALUES } from './constants'

const plugin = useFieldPlugin<FieldData>({
  // Validation is needed, because you could set an
  // invalid default value, when using the plugin.
  validateContent(content: unknown) {
    if (content === '') {
      return { content }
    }

    const parsed = z
      .object({
        text: z.string().min(1),
        element: z.enum(ELEMENT_VALUES),
        style: z.enum(STYLE_VALUES).optional(),
      })
      .safeParse(content)

    return parsed.success
      ? { content: parsed.data }
      : { content: '', error: z.prettifyError(parsed.error) }
  },
})

const styleShown = computed(() =>
  z.stringbool().catch(false).parse(plugin.data?.options.showStyle),
)
</script>

<template>
  <template v-if="plugin.type === 'loaded'">
    <HeaderInput
      @update:model-value="(value) => plugin.actions?.setContent(value)"
      :model-value="plugin.data.content"
      :seo-default="plugin.data.options.seoDefault"
      :seo-label="plugin.data.options.seoLabel"
      :text-label="plugin.data.options.textLabel"
      :style-default="plugin.data.options.styleDefault"
      :style-label="plugin.data.options.styleLabel"
      :style-shown="styleShown"
      :style-allowed="plugin.data.options.styleAllowed"
    />
  </template>
</template>
