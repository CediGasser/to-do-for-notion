<script lang="ts">
  import type { Task } from '$lib/models/task'
  import { isTaskCompleted } from '$lib/models/task'
  import Checkbox from './checkbox.svelte'
  import Title from './title.svelte'
  import { notionClient } from '$lib/services/notion/client'
  import { isEnumToBooleanMapping } from '$lib/models/field-mapping'
  import type { UpdatePageParameters } from '@notionhq/client'

  interface Props {
    task: Task
  }
  let { task }: Props = $props()

  // Derive completion state
  let isCompleted = $derived(isTaskCompleted(task))

  // Handle checkbox change
  async function handleCompletedChange(checked: boolean) {
    const { mapping, pageId } = task.completed

    // Build the update payload based on mapping type
    let properties: UpdatePageParameters['properties']

    if (mapping.mappingType === 'checkbox') {
      properties = {
        [mapping.propertyName]: {
          checkbox: checked,
        },
      }
    } else if (isEnumToBooleanMapping(mapping)) {
      const targetOption = checked ? mapping.trueOption : mapping.falseOption
      properties = {
        [mapping.propertyName]: {
          status: {
            id: targetOption.id,
          },
        },
      }
    } else {
      return
    }

    try {
      await notionClient.updatePage(pageId, properties)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }
</script>

<div
  class="flex flex-row items-center gap-3 p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
  class:opacity-60={isCompleted}
>
  <Checkbox field={task.completed} onchange={handleCompletedChange} />
  <Title field={task.title} />

  {#if task.dueDate}
    <span class="text-sm text-muted-foreground ml-auto">
      <!-- Due date display would go here -->
    </span>
  {/if}
</div>
