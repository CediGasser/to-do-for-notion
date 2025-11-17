<script lang="ts">
  import type { Property } from '$lib/types'
  import { isCheckboxProperty, isStatusProperty } from '$lib/type-guards'

  interface Props {
    property: Property
  }
  let { property = $bindable() }: Props = $props()
</script>

{#if isCheckboxProperty(property)}
  <input type="checkbox" bind:checked={property.checkbox} class="w-5 h-5" />
{:else if isStatusProperty(property)}
  <input
    type="checkbox"
    bind:checked={
      () => property.status.name === 'Done',
      (val) => (property.status.name = val ? 'Done' : 'Not Done')
    }
    class="w-5 h-5"
  />
{/if}
