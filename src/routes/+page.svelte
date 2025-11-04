<script lang="ts">
  import { getEntriesFromDataSource } from '$lib/notion'

  let { data } = $props()

  let selectedDataSourceId = $state(data.dataSources[0].id)

  let entries = $derived(getEntriesFromDataSource(selectedDataSourceId))
</script>

<main>
  <h1 class="text-4xl font-bold mb-8">Databases:</h1>
  <ul class="list-disc list-inside mb-12">
    {#each data.dataSources as dataSource}
      <li class="mb-2">
        <span class="font-semibold">{dataSource.title[0].plain_text}</span> -
        <span class="italic">{dataSource.description[0].plain_text}</span>
      </li>
    {/each}
  </ul>

  <h2 class="text-3xl font-bold mb-6">Entries from Selected Data Source:</h2>
  <select
    bind:value={selectedDataSourceId}
    class="mb-6 p-2 border border-gray-300 rounded"
  >
    {#each data.dataSources as dataSource}
      <option value={dataSource.id}>{dataSource.title[0].plain_text}</option>
    {/each}
  </select>

  <div class="mx-auto max-w-3xl w-full px-4 mb-12">
    {#await entries}
      <p>Loading entries...</p>
    {:then entriesData}
      {#if entriesData.length === 0}
        <p>No entries found for this data source.</p>
      {:else}
        <ul class="list-disc list-inside">
          {#each entriesData as entry}
            <span>{entry.properties.Description.richt_text.plain_text}</span>
            <span>{entry.properties.Status.status.name}</span>
            <pre class="text-xs">{JSON.stringify(entry, null, 2)}</pre>
          {/each}
        </ul>
      {/if}
    {:catch error}
      <p class="text-red-500">Error loading entries: {error.message}</p>
    {/await}
  </div>

  <span class="font-bold text-red-500 mb-6 block">Data Sources</span>
  <div class="mx-auto max-w-3xl w-full px-4">
    <pre>{JSON.stringify(data.dataSources, null, 2)}</pre>
    <pre>{JSON.stringify(data.error, null, 2)}</pre>
  </div>
</main>

<style>
</style>
