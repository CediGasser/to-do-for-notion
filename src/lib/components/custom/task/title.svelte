<script lang="ts">
  import type { Property } from '$lib/types'

  interface Props {
    property: Property
  }
  let { property = $bindable() }: Props = $props()
</script>

{#if property.type === 'title'}
  <h3 class="text-lg">
    {#each property.title as titlePart}
      {#if titlePart.type === 'text'}
        {titlePart.text.content}
      {/if}
    {/each}
  </h3>
{:else}
  <p class="text-lg font-semibold">-</p>
{/if}
