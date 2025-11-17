<script lang="ts">
  import type { SimpleTask } from '$lib/types'
  interface Props {
    task: SimpleTask
  }
  let { task }: Props = $props()
</script>

<div class="p-4 border rounded shadow-sm mb-4">
  <h2 class="text-xl font-semibold mb-2">{task.title}</h2>
  <p class="mb-1">
    <strong>Completed:</strong>
    {task.completed ? 'Yes' : 'No'}
  </p>
  {#if task.category}
    <p class="mb-1">
      <strong>Category:</strong>
      {task.category}
    </p>
  {/if}
  {#if task.dueDate}
    <p class="mb-1">
      <strong>Due Date:</strong>
      {task.dueDate}
    </p>
  {/if}
  {#if task.priority}
    <p class="mb-1">
      <strong>Priority:</strong>
      {task.priority}
    </p>
  {/if}
  {#if task.doDate}
    <p class="mb-1">
      <strong>Do Date:</strong>
      {task.doDate}
    </p>
  {/if}
</div>
