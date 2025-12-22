/**
 * @file src/lib/services/notion/types.ts
 * @description Notion-specific type definitions and re-exports
 */

import type {
  PageObjectResponse,
  DataSourceObjectResponse,
} from '@notionhq/client'

// Re-export type guards
export { isFullPage, isFullDataSource } from '@notionhq/client'

// Re-export commonly used types
export type {
  PageObjectResponse,
  DataSourceObjectResponse,
  UpdatePageParameters,
} from '@notionhq/client'

/**
 * Property value from a Notion page
 */
export type NotionPropertyValue = PageObjectResponse['properties'][string]

/**
 * Property definition from a Notion data source schema
 */
export type NotionPropertyDefinition =
  DataSourceObjectResponse['properties'][string]

/**
 * Select option from a select/status property
 */
export interface NotionSelectOption {
  id: string
  name: string
  color: string
  description?: string | null
}

interface SelectOptionShape {
  id: string
  name: string
  color?: string
  description?: string | null
}

/**
 * Extract select options from a property definition
 */
export function getSelectOptions(
  property: NotionPropertyDefinition
): NotionSelectOption[] {
  switch (property.type) {
    case 'select':
      return (property.select?.options ?? []).map((opt: SelectOptionShape) => ({
        id: opt.id,
        name: opt.name,
        color: opt.color ?? 'default',
        description: opt.description,
      }))
    case 'status':
      return (property.status?.options ?? []).map((opt: SelectOptionShape) => ({
        id: opt.id,
        name: opt.name,
        color: opt.color ?? 'default',
        description: opt.description,
      }))
    case 'multi_select':
      return (property.multi_select?.options ?? []).map(
        (opt: SelectOptionShape) => ({
          id: opt.id,
          name: opt.name,
          color: opt.color ?? 'default',
          description: opt.description,
        })
      )
    default:
      return []
  }
}

/**
 * Get the value of a checkbox property
 */
export function getCheckboxValue(
  property: NotionPropertyValue
): boolean | null {
  if (property.type !== 'checkbox') return null
  return property.checkbox
}

/**
 * Get the value of a status property
 */
export function getStatusValue(
  property: NotionPropertyValue
): { id: string; name: string } | null {
  if (property.type !== 'status' || !property.status) return null
  return { id: property.status.id, name: property.status.name }
}

/**
 * Get the value of a select property
 */
export function getSelectValue(
  property: NotionPropertyValue
): { id: string; name: string } | null {
  if (property.type !== 'select' || !property.select) return null
  return { id: property.select.id, name: property.select.name }
}

/**
 * Get the plain text value of a title property
 */
export function getTitleValue(property: NotionPropertyValue): string {
  if (property.type !== 'title') return ''
  return property.title.map((t) => t.plain_text).join('')
}

/**
 * Get the date value of a date property
 */
export function getDateValue(
  property: NotionPropertyValue
): { start: string; end?: string | null } | null {
  if (property.type !== 'date' || !property.date) return null
  return { start: property.date.start, end: property.date.end }
}
