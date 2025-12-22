/**
 * @file src/lib/services/notion/queries.ts
 * @description Query builders for Notion API
 */

import type { TaskListFilter } from '$lib/config/types'
import type { FieldMappings } from '$lib/models/field-mapping'

/**
 * Notion filter type (simplified for common use cases)
 */
export type NotionFilter =
  | {
      property?: string
      [key: string]: unknown
    }
  | {
      and?: NotionFilter[]
    }
  | {
      or?: NotionFilter[]
    }

/**
 * Convert a task list filter to Notion filter format
 */
export function taskFilterToNotionFilter(
  filter: TaskListFilter,
  mappings: FieldMappings
): NotionFilter | null {
  const propertyName = getPropertyName(filter.field, mappings)
  if (!propertyName) return null

  switch (filter.type) {
    case 'category':
      return buildCategoryFilter(propertyName, filter)
    case 'status':
      return buildStatusFilter(propertyName, filter)
    case 'date':
      return buildDateFilter(propertyName, filter)
    case 'priority':
      return buildPriorityFilter(propertyName, filter)
    default:
      return null
  }
}

/**
 * Combine multiple filters with AND logic
 */
export function combineFilters(
  filters: (NotionFilter | null)[]
): NotionFilter | undefined {
  const validFilters = filters.filter((f): f is NotionFilter => f !== null)

  if (validFilters.length === 0) return undefined
  if (validFilters.length === 1) return validFilters[0]

  return {
    and: validFilters,
  }
}

/**
 * Get property name from mappings
 */
function getPropertyName(
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
    return mapping?.propertyName ?? null
  }

  return field
}

/**
 * Build a category (select) filter
 */
function buildCategoryFilter(
  propertyName: string,
  filter: TaskListFilter
): NotionFilter | null {
  switch (filter.operator) {
    case 'equals':
      return {
        property: propertyName,
        select: { equals: String(filter.value) },
      }
    case 'is_empty':
      return {
        property: propertyName,
        select: { is_empty: true },
      }
    case 'is_not_empty':
      return {
        property: propertyName,
        select: { is_not_empty: true },
      }
    default:
      return null
  }
}

/**
 * Build a status filter
 */
function buildStatusFilter(
  propertyName: string,
  filter: TaskListFilter
): NotionFilter | null {
  switch (filter.operator) {
    case 'equals':
      return {
        property: propertyName,
        status: { equals: String(filter.value) },
      }
    case 'is_empty':
      return {
        property: propertyName,
        status: { is_empty: true },
      }
    case 'is_not_empty':
      return {
        property: propertyName,
        status: { is_not_empty: true },
      }
    default:
      return null
  }
}

/**
 * Build a date filter
 */
function buildDateFilter(
  propertyName: string,
  filter: TaskListFilter
): NotionFilter | null {
  switch (filter.operator) {
    case 'equals':
      if (filter.value === 'today') {
        return {
          property: propertyName,
          date: { equals: new Date().toISOString().split('T')[0] },
        }
      }
      return {
        property: propertyName,
        date: { equals: String(filter.value) },
      }
    case 'before':
      return {
        property: propertyName,
        date: { before: String(filter.value) },
      }
    case 'after':
      return {
        property: propertyName,
        date: { after: String(filter.value) },
      }
    case 'is_empty':
      return {
        property: propertyName,
        date: { is_empty: true },
      }
    case 'is_not_empty':
      return {
        property: propertyName,
        date: { is_not_empty: true },
      }
    default:
      return null
  }
}

/**
 * Build a priority filter
 */
function buildPriorityFilter(
  propertyName: string,
  filter: TaskListFilter
): NotionFilter | null {
  switch (filter.operator) {
    case 'equals':
      return {
        property: propertyName,
        select: { equals: String(filter.value) },
      }
    case 'is_empty':
      return {
        property: propertyName,
        select: { is_empty: true },
      }
    case 'is_not_empty':
      return {
        property: propertyName,
        select: { is_not_empty: true },
      }
    default:
      return null
  }
}

/**
 * Build sort options for data source query
 */
export function buildSortOptions(
  sortOrder: 'manual' | 'dueDate' | 'priority' | 'alphabetical',
  mappings: FieldMappings
): object[] | undefined {
  switch (sortOrder) {
    case 'dueDate':
      if (mappings.dueDate) {
        return [
          { property: mappings.dueDate.propertyName, direction: 'ascending' },
        ]
      }
      break
    case 'priority':
      if (mappings.priority) {
        return [
          { property: mappings.priority.propertyName, direction: 'descending' },
        ]
      }
      break
    case 'alphabetical':
      return [{ property: mappings.title.propertyName, direction: 'ascending' }]
    case 'manual':
    default:
      break
  }
  return undefined
}
