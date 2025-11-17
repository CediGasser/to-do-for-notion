<script lang="ts">
  import Task from '$lib/components/custom/task.svelte'

  let { data } = $props()
</script>

<ul class="list-none">
  {#each data.tasks as task}
    <Task {task} />
  {/each}
</ul>

<pre>{JSON.stringify(data.tasks, null, 2)}</pre>
