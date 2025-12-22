<script lang="ts">
  import type { Property } from '$lib/types'
  import type { MappedFieldValue } from '$lib/models/task'
  import type {
    EnumToBooleanMapping,
    CheckboxPropertyMapping,
  } from '$lib/models/field-mapping'
  import {
    isCheckboxMapping,
    isEnumToBooleanMapping,
  } from '$lib/models/field-mapping'
  import { isCheckboxProperty, isStatusProperty } from '$lib/type-guards'

  interface Props {
    /** The mapped field value containing property and mapping info */
    field: MappedFieldValue<EnumToBooleanMapping | CheckboxPropertyMapping>
    /** Called when the value changes */
    onchange?: (checked: boolean) => void
  }
  let { field, onchange }: Props = $props()

  // Derive the checked state based on the mapping type
  let isChecked = $derived.by(() => {
    const { property, mapping } = field

    if (isCheckboxMapping(mapping) && isCheckboxProperty(property)) {
      return property.checkbox
    }

    if (isEnumToBooleanMapping(mapping)) {
      if (isStatusProperty(property)) {
        return property.status?.id === mapping.trueOption.id
      }
      // Handle select type if needed
      if (property.type === 'select') {
        return property.select?.id === mapping.trueOption.id
      }
    }

    return false
  })

  // Get the available options for status fields (for long-press menu)
  let statusOptions = $derived.by(() => {
    const { mapping } = field
    if (isEnumToBooleanMapping(mapping)) {
      return {
        trueOption: mapping.trueOption,
        falseOption: mapping.falseOption,
      }
    }
    return null
  })

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement
    onchange?.(target.checked)
  }
</script>

<input
  type="checkbox"
  checked={isChecked}
  onchange={handleChange}
  class="w-5 h-5 cursor-pointer accent-primary"
  aria-label="Toggle task completion"
/>

{#if statusOptions}
  <!-- This data can be used for a long-press menu to select specific status -->
  <span class="sr-only">
    Options: {statusOptions.trueOption.name}, {statusOptions.falseOption.name}
  </span>
{/if}
