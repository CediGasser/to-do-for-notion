import { PUBLIC_NOTION_INTEGRATION_SECRET } from '$env/static/public'
import { Client, isFullDataSource, isFullPage } from '@notionhq/client'
import { fetch } from '@tauri-apps/plugin-http'
import type { UpdatePageParameters } from '@notionhq/client'

const client = new Client({
  auth: PUBLIC_NOTION_INTEGRATION_SECRET,
  // Using Tauri's HTTP plugin to make requests be sent from the backend without CORS issues
  fetch: fetch,
})

export const getDataSources = async () => {
  const response = await client.search({
    filter: {
      property: 'object',
      value: 'data_source',
    },
  })

  const dataSources = response.results
    .filter(isFullDataSource)
    .filter((ds) => !ds.archived && !ds.in_trash)

  return dataSources
}

export const getDataSourceById = async (id: string) => {
  const dataSource = await client.dataSources.retrieve({ data_source_id: id })

  if (!isFullDataSource(dataSource)) {
    throw new Error('Data source is not a full data source')
  }

  return dataSource
}

export const getEntriesFromDataSource = async (dataSourceId: string) => {
  const response = await client.dataSources.query({
    data_source_id: dataSourceId,
  })

  const entries = response.results
    .filter(isFullPage)
    .filter((page) => !page.archived && !page.in_trash)

  return entries
}

export const updatePageProperties = async (
  pageId: string,
  properties: UpdatePageParameters['properties']
) => {
  await client.pages.update({
    page_id: pageId,
    properties: properties,
  })
}
