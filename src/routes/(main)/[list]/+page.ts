import { getDataSources, getEntriesFromDataSource } from '$lib/notion'

export const load = async ({ params }) => {
  if (!params.list) {
    return { tasks: [] }
  }

  const dataSources = await getDataSources()
  const notionEntries = await getEntriesFromDataSource(dataSources[0].id)

  return { tasks: notionEntries }
}
