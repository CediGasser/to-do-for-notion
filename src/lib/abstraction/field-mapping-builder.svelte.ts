/**
 * @file src/lib/abstraction/field-mapping-builder.svelte.ts
 * @description Builder for creating field mappings with reactive state
 *
 * This replaces the old DataSourceMappingBuilder with the new FieldMappings type
 * that preserves Notion field type information for UI components.
 */

import type {
  DataSourceObjectResponse,
  PageObjectResponse,
} from '@notionhq/client'
import type { PropertyDefinition, OptionDefinition } from '$lib/types'
import type {
  FieldMappings,
  DirectPropertyMapping,
  EnumToBooleanMapping,
  CheckboxPropertyMapping,
} from '$lib/models/field-mapping'
import {
  createDirectMapping,
  createEnumToBooleanMapping,
  createCheckboxMapping,
} from '$lib/models/field-mapping'
import type { TaskListDefinition } from '$lib/config/types'
import { createCategoryTaskList } from '$lib/models/task-list'
import { DEFAULT_SYSTEM_LISTS } from '$lib/config/types'

/**
 * Builder class for creating field mappings with Svelte 5 reactive state
 */
export class FieldMappingBuilder {
  // Data source
  public dataSource: DataSourceObjectResponse | null = $state(null)

  // Property selections (PropertyDefinition from Notion schema)
  public titleProperty: PropertyDefinition | null = $state(null)
  public completedProperty: PropertyDefinition | null = $state(null)
  public categoryProperty: PropertyDefinition | null = $state(null)
  public dueDateProperty: PropertyDefinition | null = $state(null)
  public priorityProperty: PropertyDefinition | null = $state(null)
  public doDateProperty: PropertyDefinition | null = $state(null)

  // Enum mappings for completed status (when using status/select type)
  public completedTrueOption: OptionDefinition | null = $state(null)
  public completedFalseOption: OptionDefinition | null = $state(null)

  // Validation state
  public isValidMapping = $derived.by(() => {
    const mandatoryPropertiesExist =
      this.titleProperty !== null && this.completedProperty !== null

    const dataSourceExists = this.dataSource !== null

    // If completed is a status/select, we need both enum mappings
    const completedPropertyValid =
      this.completedProperty?.type === 'checkbox' ||
      (this.completedTrueOption !== null && this.completedFalseOption !== null)

    // Enum options should be different
    const completedOptionsNotEqual =
      this.completedProperty?.type === 'checkbox' ||
      this.completedTrueOption?.id !== this.completedFalseOption?.id

    return (
      mandatoryPropertiesExist &&
      dataSourceExists &&
      completedPropertyValid &&
      completedOptionsNotEqual
    )
  })

  // Whether the completed property needs enum mapping
  public completedNeedsEnumMapping = $derived(
    this.completedProperty?.type === 'status' ||
      this.completedProperty?.type === 'select'
  )

  /**
   * Get possible properties for a given task field
   */
  getPossiblePropertiesFor(
    fieldName: keyof Omit<FieldMappings, 'completed'>
  ): PropertyDefinition[] {
    if (!this.dataSource) return []

    const propertyTypeMap: Record<string, PropertyDefinition['type'][]> = {
      title: ['title'],
      category: ['select', 'multi_select', 'rich_text'],
      dueDate: ['date'],
      priority: ['select', 'number', 'rich_text'],
      doDate: ['date'],
    }

    const desiredTypes = propertyTypeMap[fieldName]
    if (!desiredTypes) return []

    return Object.values(this.dataSource.properties).filter((prop) =>
      desiredTypes.includes(prop.type)
    )
  }

  /**
   * Get possible properties for completed field (checkbox or status)
   */
  getPossibleCompletedProperties(): PropertyDefinition[] {
    if (!this.dataSource) return []

    return Object.values(this.dataSource.properties).filter(
      (prop) => prop.type === 'checkbox' || prop.type === 'status'
    )
  }

  /**
   * Get possible enum options for a status/select property
   */
  getEnumOptionsFor(property: PropertyDefinition | null): OptionDefinition[] {
    if (!property) return []

    if (property.type === 'status' && property.status?.options) {
      return property.status.options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        color: opt.color as OptionDefinition['color'],
        description: opt.description ?? undefined,
      }))
    }

    if (property.type === 'select' && property.select?.options) {
      return property.select.options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        color: opt.color as OptionDefinition['color'],
        description: opt.description ?? undefined,
      }))
    }

    return []
  }

  /**
   * Get suggested task lists based on category property
   */
  getSuggestedTaskLists(): TaskListDefinition[] {
    const systemLists = [...DEFAULT_SYSTEM_LISTS]

    if (!this.categoryProperty) {
      return systemLists
    }

    const categoryOptions = this.getEnumOptionsFor(this.categoryProperty)
    const customLists = categoryOptions.map((opt, index) =>
      createCategoryTaskList(opt.id, opt.name, index)
    )

    return [...systemLists, ...customLists]
  }

  /**
   * Build the field mappings object
   * @throws Error if mapping is not valid
   */
  build(): FieldMappings {
    if (!this.isValidMapping) {
      throw new Error('Cannot build mapping: mapping is not valid')
    }

    // Build title mapping (always direct)
    const title = createDirectMapping(
      this.titleProperty!.id,
      'title',
      this.titleProperty!.name
    )

    // Build completed mapping (checkbox or enum)
    let completed: EnumToBooleanMapping | CheckboxPropertyMapping
    if (this.completedProperty!.type === 'checkbox') {
      completed = createCheckboxMapping(
        this.completedProperty!.id,
        this.completedProperty!.name
      )
    } else {
      completed = createEnumToBooleanMapping(
        this.completedProperty!.id,
        this.completedProperty!.type as 'status' | 'select',
        this.completedProperty!.name,
        this.completedTrueOption!,
        this.completedFalseOption!
      )
    }

    const mappings: FieldMappings = {
      title,
      completed,
    }

    // Optional mappings
    if (this.categoryProperty) {
      mappings.category = createDirectMapping(
        this.categoryProperty.id,
        this.categoryProperty.type,
        this.categoryProperty.name
      )
    }

    if (this.dueDateProperty) {
      mappings.dueDate = createDirectMapping(
        this.dueDateProperty.id,
        'date',
        this.dueDateProperty.name
      )
    }

    if (this.priorityProperty) {
      mappings.priority = createDirectMapping(
        this.priorityProperty.id,
        this.priorityProperty.type,
        this.priorityProperty.name
      )
    }

    if (this.doDateProperty) {
      mappings.doDate = createDirectMapping(
        this.doDateProperty.id,
        'date',
        this.doDateProperty.name
      )
    }

    return mappings
  }

  /**
   * Reset all selections
   */
  reset(): void {
    this.dataSource = null
    this.titleProperty = null
    this.completedProperty = null
    this.categoryProperty = null
    this.dueDateProperty = null
    this.priorityProperty = null
    this.doDateProperty = null
    this.completedTrueOption = null
    this.completedFalseOption = null
  }
}
