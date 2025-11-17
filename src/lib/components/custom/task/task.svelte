<script lang="ts">
  import { updatePageProperties } from '$lib/notion'
  import type { PageObjectResponse } from '@notionhq/client'
  import Checkbox from './checkbox.svelte'
  import { mappings } from '$lib/abstraction/mapping.svelte'
  import Title from './title.svelte'

  interface Props {
    task: PageObjectResponse
  }
  let { task }: Props = $props()

  let mapping = Array.from(mappings.values())[0]
</script>

<div class="flex flex-row items-center gap-2 p-2 border rounded-lg shadow-sm">
  <Checkbox property={mapping.getMappedProperty('completed', task)} />
  <Title property={mapping.getMappedProperty('title', task)} />
</div>
