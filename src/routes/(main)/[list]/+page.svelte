<script lang="ts">
  import Task from '$lib/components/custom/task/task.svelte'

  let { data } = $props()
</script>

<ul class="list-none flex flex-col p-0 m-0 gap-1">
  {#each data.tasks as task}
    <Task {task} />
  {/each}
</ul>
