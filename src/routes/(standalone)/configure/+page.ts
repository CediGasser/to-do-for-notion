import { notionClient } from '$lib/services/notion/client'

export const load = async () => {
  const dataSources = await notionClient.getDataSources()

  return {
    dataSources,
  }
}
