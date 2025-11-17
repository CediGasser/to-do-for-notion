import { getDataSources, getEntriesFromDataSource } from '$lib/notion'
import { mappings } from '$lib/abstraction/mapping.svelte.js'

export const load = async ({ params }) => {
  if (!params.list) {
    return { tasks: [] }
  }

  const mapping = Array.from(mappings.values())[0] // For now, just get the first mapping

  const dataSources = await getDataSources()
  const notionEntries = await getEntriesFromDataSource(dataSources[0].id)

  const simpleTasks = notionEntries.map((entry) => mapping.fromNotion(entry))

  return { tasks: simpleTasks }
}
