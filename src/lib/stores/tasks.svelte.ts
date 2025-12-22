/**
 * @file src/lib/stores/tasks.svelte.ts
 * @description Task store with caching and sync integration
 */

import type { Task } from '$lib/models/task'
import type { FieldMappings } from '$lib/models/field-mapping'
import { pageToTask } from '$lib/models/task'
import type { PageObjectResponse } from '@notionhq/client'

/**
 * Creates a reactive task store for a data source
 */
function createTaskStore() {
  // Reactive state
  let tasksByDataSource = $state<Record<string, Task[]>>({})
  let currentDataSourceId = $state<string | null>(null)
  let isLoading = $state(false)
  let lastError = $state<string | null>(null)

  // Derived
  const currentTasks = $derived(
    currentDataSourceId ? tasksByDataSource[currentDataSourceId] ?? [] : []
  )

  /**
   * Set the current active data source
   */
  function setCurrentDataSource(dataSourceId: string): void {
    currentDataSourceId = dataSourceId
  }

  /**
   * Load tasks from Notion pages
   */
  function loadTasks(
    dataSourceId: string,
    pages: PageObjectResponse[],
    mappings: FieldMappings
  ): void {
    const tasks = pages
      .map((page) => pageToTask(page, mappings))
      .filter((task): task is Task => task !== null)

    tasksByDataSource = {
      ...tasksByDataSource,
      [dataSourceId]: tasks,
    }
  }

  /**
   * Update a single task in the store
   */
  function updateTask(dataSourceId: string, updatedTask: Task): void {
    const tasks = tasksByDataSource[dataSourceId] ?? []
    const index = tasks.findIndex((t) => t.id === updatedTask.id)

    if (index >= 0) {
      const newTasks = [...tasks]
      newTasks[index] = updatedTask
      tasksByDataSource = {
        ...tasksByDataSource,
        [dataSourceId]: newTasks,
      }
    }
  }

  /**
   * Add a new task to the store
   */
  function addTask(dataSourceId: string, task: Task): void {
    const tasks = tasksByDataSource[dataSourceId] ?? []
    tasksByDataSource = {
      ...tasksByDataSource,
      [dataSourceId]: [task, ...tasks],
    }
  }

  /**
   * Remove a task from the store
   */
  function removeTask(dataSourceId: string, taskId: string): void {
    const tasks = tasksByDataSource[dataSourceId] ?? []
    tasksByDataSource = {
      ...tasksByDataSource,
      [dataSourceId]: tasks.filter((t) => t.id !== taskId),
    }
  }

  /**
   * Get a specific task
   */
  function getTask(dataSourceId: string, taskId: string): Task | undefined {
    return tasksByDataSource[dataSourceId]?.find((t) => t.id === taskId)
  }

  /**
   * Get tasks for a specific data source
   */
  function getTasks(dataSourceId: string): Task[] {
    return tasksByDataSource[dataSourceId] ?? []
  }

  /**
   * Clear tasks for a data source
   */
  function clearTasks(dataSourceId: string): void {
    const { [dataSourceId]: _, ...rest } = tasksByDataSource
    tasksByDataSource = rest
  }

  /**
   * Clear all tasks
   */
  function clearAll(): void {
    tasksByDataSource = {}
  }

  return {
    // Reactive getters
    get currentTasks() {
      return currentTasks
    },
    get currentDataSourceId() {
      return currentDataSourceId
    },
    get isLoading() {
      return isLoading
    },
    get lastError() {
      return lastError
    },
    // Actions
    setCurrentDataSource,
    loadTasks,
    updateTask,
    addTask,
    removeTask,
    getTask,
    getTasks,
    clearTasks,
    clearAll,
    // Internal setters for loading state
    setLoading(loading: boolean) {
      isLoading = loading
    },
    setError(error: string | null) {
      lastError = error
    },
  }
}

// Export singleton instance
export const taskStore = createTaskStore()
