import { DataSourceConfigManager } from '$lib/config/index'
import { notionClient } from '$lib/services/notion/client'
import { pageToTask, type Task } from '$lib/models/task'
import { filterTasksForList } from '$lib/models/task-list'
import { DEFAULT_SYSTEM_LISTS } from '$lib/config/types'

export const load = async ({ params, parent }) => {
  const { dataSourceId, list: listId } = params

  if (!listId || !dataSourceId) {
    return { tasks: [] }
  }

  // Get parent data which includes mapping and taskLists
  const parentData = await parent()
  const { mapping, taskLists } = parentData

  if (!mapping) {
    return { tasks: [], listId }
  }

  // Fetch all pages from the data source
  const pages = await notionClient.getAllPagesFromDataSource(dataSourceId)

  // Convert pages to tasks
  const allTasks: Task[] = pages
    .map((page) => pageToTask(page, mapping))
    .filter((task): task is Task => task !== null)

  // Find the list definition
  let listDef = taskLists?.find((l) => l.id === listId)

  // Check system lists if not found in custom lists
  if (!listDef) {
    listDef = DEFAULT_SYSTEM_LISTS.find((l) => l.id === listId)
  }

  // If still no list found (e.g., "default"), show all tasks
  if (!listDef && (listId === 'default' || listId === 'all')) {
    return { tasks: allTasks, listId }
  }

  // Filter tasks based on list definition
  const filteredTasks = listDef
    ? filterTasksForList(allTasks, listDef, mapping)
    : allTasks

  return { tasks: filteredTasks, listId }
}
