import { getDataSources } from '$lib/notion'

export const load = async () => {
  try {
    const dataSources = await getDataSources()
    return {
      dataSources,
      error: null,
    }
  } catch (error) {
    return {
      dataSources: [],
      error: error,
    }
  }
}
