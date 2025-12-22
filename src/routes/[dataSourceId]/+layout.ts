import { DataSourceConfigManager } from '$lib/config/index'
import { notionClient } from '$lib/services/notion/client'

export const load = async ({ params }) => {
  const selectedDataSourceId = params.dataSourceId || null

  // Get the config manager
  const configManager = await DataSourceConfigManager.getInstance()

  // Get mapping for selected data source
  const mapping = selectedDataSourceId
    ? configManager.getFieldMappings(selectedDataSourceId)
    : null

  // Get all configured data sources
  const allDataSourceConfigs = configManager.getAllDataSources()
  const dataSourcePromises = allDataSourceConfigs.map((dsConfig) =>
    notionClient.getDataSource(dsConfig.id)
  )
  const dataSources = (await Promise.all(dataSourcePromises)).filter(
    (ds) => ds !== null
  )

  // Get task lists for this data source
  const taskLists = selectedDataSourceId
    ? configManager.getTaskLists(selectedDataSourceId)
    : []

  return {
    mapping,
    dataSources,
    selectedDataSourceId,
    taskLists,
  }
}
