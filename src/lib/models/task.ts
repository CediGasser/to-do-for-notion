/**
 * @file src/lib/models/task.ts
 * @description Task domain model with preserved field type information
 *
 * This model represents a task but keeps references to the original
 * Notion properties so UI components can react to specific types.
 */

import type { PageObjectResponse } from '@notionhq/client'
import type { Property } from '$lib/types'
import type {
  FieldMappings,
  PropertyMappingType,
  DirectPropertyMapping,
  EnumToBooleanMapping,
  CheckboxPropertyMapping,
} from './field-mapping'

/**
 * A field value with its mapping information
 * This allows UI components to know the original field type
 */
export interface MappedFieldValue<
  T extends PropertyMappingType = PropertyMappingType
> {
  /** The raw Notion property */
  property: Property
  /** The mapping configuration */
  mapping: T
  /** The original page ID for updates */
  pageId: string
}

/**
 * Task model that preserves field type information
 */
export interface Task {
  /** Notion page ID */
  id: string

  /** The original Notion page for full access */
  notionPage: PageObjectResponse

  /** Title field with mapping (always direct) */
  title: MappedFieldValue<DirectPropertyMapping>

  /** Completed field with mapping (can be checkbox or enum) */
  completed: MappedFieldValue<EnumToBooleanMapping | CheckboxPropertyMapping>

  /** Optional category field */
  category?: MappedFieldValue<DirectPropertyMapping>

  /** Optional due date field */
  dueDate?: MappedFieldValue<DirectPropertyMapping>

  /** Optional priority field */
  priority?: MappedFieldValue<DirectPropertyMapping>

  /** Optional do date field ("My Day" date) */
  doDate?: MappedFieldValue<DirectPropertyMapping>
}

/**
 * Converts a Notion page to a Task using the provided field mappings
 */
export function pageToTask(
  page: PageObjectResponse,
  mappings: FieldMappings
): Task | null {
  const getProperty = (propertyId: string): Property | null => {
    return Object.values(page.properties).find(
      (prop) => prop.id === propertyId
    ) as Property | null
  }

  // Required fields
  const titleProp = getProperty(mappings.title.notionPropertyId)
  const completedProp = getProperty(mappings.completed.notionPropertyId)

  if (!titleProp || !completedProp) {
    console.warn(`Task ${page.id} is missing required fields`)
    return null
  }

  const task: Task = {
    id: page.id,
    notionPage: page,
    title: {
      property: titleProp,
      mapping: mappings.title,
      pageId: page.id,
    },
    completed: {
      property: completedProp,
      mapping: mappings.completed,
      pageId: page.id,
    },
  }

  // Optional fields
  if (mappings.category) {
    const prop = getProperty(mappings.category.notionPropertyId)
    if (prop) {
      task.category = {
        property: prop,
        mapping: mappings.category,
        pageId: page.id,
      }
    }
  }

  if (mappings.dueDate) {
    const prop = getProperty(mappings.dueDate.notionPropertyId)
    if (prop) {
      task.dueDate = {
        property: prop,
        mapping: mappings.dueDate,
        pageId: page.id,
      }
    }
  }

  if (mappings.priority) {
    const prop = getProperty(mappings.priority.notionPropertyId)
    if (prop) {
      task.priority = {
        property: prop,
        mapping: mappings.priority,
        pageId: page.id,
      }
    }
  }

  if (mappings.doDate) {
    const prop = getProperty(mappings.doDate.notionPropertyId)
    if (prop) {
      task.doDate = {
        property: prop,
        mapping: mappings.doDate,
        pageId: page.id,
      }
    }
  }

  return task
}

/**
 * Get the display title from a task
 */
export function getTaskTitle(task: Task): string {
  const prop = task.title.property
  if (prop.type === 'title' && prop.title.length > 0) {
    return prop.title.map((t) => t.plain_text).join('')
  }
  return 'Untitled'
}

/**
 * Check if a task is completed
 * Works with both checkbox and status/enum mappings
 */
export function isTaskCompleted(task: Task): boolean {
  const { property, mapping } = task.completed

  if (mapping.mappingType === 'checkbox' && property.type === 'checkbox') {
    return property.checkbox
  }

  if (mapping.mappingType === 'enum_to_boolean' && property.type === 'status') {
    return property.status?.id === mapping.trueOption.id
  }

  if (mapping.mappingType === 'enum_to_boolean' && property.type === 'select') {
    return property.select?.id === mapping.trueOption.id
  }

  return false
}
