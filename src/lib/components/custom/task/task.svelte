<script lang="ts">
  import type { PageObjectResponse } from '@notionhq/client'
  import Checkbox from './checkbox.svelte'
  import { getMappingContext } from '$lib/contexts/mapping'
  import Title from './title.svelte'

  interface Props {
    task: PageObjectResponse
  }
  let { task }: Props = $props()

  let mapping = getMappingContext()

  let completedProperty = mapping.getPropertyFor('completed', task)
  let titleProperty = mapping.getPropertyFor('title', task)
</script>

<div class="flex flex-row items-center gap-2 p-2 border rounded-lg shadow-sm">
  {#if !completedProperty || !titleProperty}
    <p class="text-red-500">Invalid task properties</p>
  {:else}
    <Checkbox property={completedProperty} />
    <Title property={titleProperty} />
  {/if}
</div>
