<script lang="ts">
  import Task from '$lib/components/custom/task/task.svelte'

  let { data } = $props()
</script>

{#if data.tasks.length === 0}
  <div
    class="flex flex-col items-center justify-center py-12 text-muted-foreground"
  >
    <p class="text-lg">No tasks found</p>
    <p class="text-sm mt-2">Tasks in this list will appear here</p>
  </div>
{:else}
  <ul class="list-none flex flex-col p-0 m-0 gap-2">
    {#each data.tasks as task (task.id)}
      <li>
        <Task {task} />
      </li>
    {/each}
  </ul>
{/if}
