import config from '$lib/config'
import { getDataSourceById } from '$lib/notion'

export const load = async ({ params }) => {
  const selectedDataSourceId = params.dataSourceId || null

  const mapping = config.dataSourceMappings[selectedDataSourceId || ''] || null
  const dataSourcePromises = Object.keys(config.dataSourceMappings).map(
    (dsId) => getDataSourceById(dsId)
  )
  const dataSources = (await Promise.all(dataSourcePromises)).filter(
    (ds) => ds !== null
  )

  return {
    mapping,
    dataSources,
    selectedDataSourceId,
  }
}
