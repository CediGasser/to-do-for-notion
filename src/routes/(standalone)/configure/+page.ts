import { getDataSources } from '$lib/notion/index.js'

export const load = async ({ params }) => {
  const dataSources = await getDataSources()

  return {
    dataSources,
  }
}
