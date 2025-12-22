/**
 * @file src/lib/models/task-list.ts
 * @description Task list model and filtering logic
 */

import type { Task } from './task'
import type { TaskListDefinition, TaskListFilter } from '$lib/config/types'
import type { FieldMappings } from './field-mapping'
import { isTaskCompleted } from './task'

/**
 * Runtime task list with resolved filters
 */
export interface TaskList {
  definition: TaskListDefinition
  tasks: Task[]
}

/**
 * Resolves special field placeholders in filters
 * e.g., __dueDate__ -> actual property ID from mappings
 */
function resolveFilterField(
  field: string,
  mappings: FieldMappings
): string | null {
  const fieldMap: Record<string, keyof FieldMappings> = {
    __title__: 'title',
    __completed__: 'completed',
    __category__: 'category',
    __dueDate__: 'dueDate',
    __priority__: 'priority',
    __doDate__: 'doDate',
  }

  if (field in fieldMap) {
    const mapping = mappings[fieldMap[field]]
    return mapping?.notionPropertyId ?? null
  }

  return field
}

/**
 * Check if a task matches a single filter
 */
function matchesFilter(
  task: Task,
  filter: TaskListFilter,
  mappings: FieldMappings
): boolean {
  const propertyId = resolveFilterField(filter.field, mappings)
  if (!propertyId) {
    return true // If field doesn't exist, don't filter by it
  }

  // Find the property value in the task
  const prop = Object.values(task.notionPage.properties).find(
    (p) => p.id === propertyId
  )

  switch (filter.operator) {
    case 'is_empty':
      return isPropertyEmpty(prop)
    case 'is_not_empty':
      return !isPropertyEmpty(prop)
    case 'equals':
      return matchesEquals(prop, filter.value)
    case 'contains':
      return matchesContains(prop, filter.value)
    case 'before':
    case 'after':
      return matchesDateComparison(prop, filter.operator, filter.value)
    default:
      return true
  }
}

/**
 * Check if a property is empty
 */
function isPropertyEmpty(prop: any): boolean {
  if (!prop) return true

  switch (prop.type) {
    case 'title':
      return prop.title.length === 0
    case 'rich_text':
      return prop.rich_text.length === 0
    case 'select':
      return prop.select === null
    case 'multi_select':
      return prop.multi_select.length === 0
    case 'date':
      return prop.date === null
    case 'checkbox':
      return false // Checkboxes are never "empty"
    case 'number':
      return prop.number === null
    case 'status':
      return prop.status === null
    default:
      return true
  }
}

/**
 * Check if a property equals a value
 */
function matchesEquals(prop: any, value: any): boolean {
  if (!prop) return false

  // Special handling for "today"
  if (value === 'today' && prop.type === 'date') {
    if (!prop.date?.start) return false
    const propDate = new Date(prop.date.start)
    const today = new Date()
    return (
      propDate.getFullYear() === today.getFullYear() &&
      propDate.getMonth() === today.getMonth() &&
      propDate.getDate() === today.getDate()
    )
  }

  switch (prop.type) {
    case 'select':
      return prop.select?.id === value || prop.select?.name === value
    case 'status':
      return prop.status?.id === value || prop.status?.name === value
    case 'checkbox':
      return prop.checkbox === value
    case 'number':
      return prop.number === value
    default:
      return false
  }
}

/**
 * Check if a property contains a value
 */
function matchesContains(prop: any, value: any): boolean {
  if (!prop) return false

  switch (prop.type) {
    case 'title':
      return prop.title.some((t: any) =>
        t.plain_text.toLowerCase().includes(String(value).toLowerCase())
      )
    case 'rich_text':
      return prop.rich_text.some((t: any) =>
        t.plain_text.toLowerCase().includes(String(value).toLowerCase())
      )
    case 'multi_select':
      if (Array.isArray(value)) {
        return value.some((v) =>
          prop.multi_select.some((s: any) => s.id === v || s.name === v)
        )
      }
      return prop.multi_select.some(
        (s: any) => s.id === value || s.name === value
      )
    default:
      return false
  }
}

/**
 * Check if a date property matches a before/after comparison
 */
function matchesDateComparison(
  prop: any,
  operator: 'before' | 'after',
  value: any
): boolean {
  if (!prop || prop.type !== 'date' || !prop.date?.start) return false

  const propDate = new Date(prop.date.start)
  const compareDate = value instanceof Date ? value : new Date(value)

  return operator === 'before' ? propDate < compareDate : propDate > compareDate
}

/**
 * Filter tasks for a task list
 */
export function filterTasksForList(
  tasks: Task[],
  listDef: TaskListDefinition,
  mappings: FieldMappings
): Task[] {
  if (listDef.filters.length === 0) {
    return tasks
  }

  return tasks.filter((task) =>
    listDef.filters.every((filter) => matchesFilter(task, filter, mappings))
  )
}

/**
 * Create a custom task list from a category
 */
export function createCategoryTaskList(
  categoryId: string,
  categoryName: string,
  sortOrder: number
): TaskListDefinition {
  return {
    id: `category-${categoryId}`,
    name: categoryName,
    icon: '📁',
    type: 'custom',
    filters: [
      {
        type: 'category',
        field: '__category__',
        operator: 'equals',
        value: categoryId,
      },
    ],
    sortOrder,
  }
}
