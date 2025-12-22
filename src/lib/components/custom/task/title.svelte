<script lang="ts">
  import type { MappedFieldValue } from '$lib/models/task'
  import type { DirectPropertyMapping } from '$lib/models/field-mapping'
  import { getTitleValue } from '$lib/services/notion/types'

  interface Props {
    /** The mapped field value containing property and mapping info */
    field: MappedFieldValue<DirectPropertyMapping>
  }
  let { field }: Props = $props()

  // Extract the title text
  let titleText = $derived(getTitleValue(field.property))
</script>

<h3 class="text-lg font-medium flex-1">
  {titleText || 'Untitled'}
</h3>
