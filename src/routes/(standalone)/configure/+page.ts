import { getDataSources } from '$lib/notion'

export const load = async ({ params }) => {
  const dataSources = await getDataSources()

  return {
    dataSources,
  }
}
