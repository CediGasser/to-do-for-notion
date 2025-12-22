/**
 * @file src/lib/models/field-mapping.ts
 * @description Field mapping definitions between Notion properties and task fields
 */

import type { PropertyDefinition, OptionDefinition } from '$lib/types'

/**
 * Base interface for all property mappings
 * The sourceType preserves the Notion field type for UI decisions
 */
export interface BasePropertyMapping {
  /** The Notion property ID */
  notionPropertyId: string
  /** The original Notion property type */
  sourceType: PropertyDefinition['type']
  /** Human-readable name of the Notion property */
  propertyName: string
}

/**
 * Direct property mapping - used when no transformation is needed
 * Examples: title, date, rich_text
 */
export interface DirectPropertyMapping extends BasePropertyMapping {
  mappingType: 'direct'
}

/**
 * Enum to boolean mapping - maps a select/status field to a boolean
 * Used for the completed field when using a status property
 */
export interface EnumToBooleanMapping extends BasePropertyMapping {
  mappingType: 'enum_to_boolean'
  sourceType: 'status' | 'select'
  /** The option that maps to true (e.g., "Done", "Completed") */
  trueOption: OptionDefinition
  /** The option that maps to false (e.g., "In Progress", "Not Started") */
  falseOption: OptionDefinition
}

/**
 * Checkbox mapping - direct boolean mapping
 */
export interface CheckboxPropertyMapping extends BasePropertyMapping {
  mappingType: 'checkbox'
  sourceType: 'checkbox'
}

/**
 * Union type for all property mapping types
 */
export type PropertyMappingType =
  | DirectPropertyMapping
  | EnumToBooleanMapping
  | CheckboxPropertyMapping

/**
 * All field mappings for a data source
 * Maps task field names to their Notion property mappings
 */
export interface FieldMappings {
  title: DirectPropertyMapping
  completed: EnumToBooleanMapping | CheckboxPropertyMapping
  category?: DirectPropertyMapping
  dueDate?: DirectPropertyMapping
  priority?: DirectPropertyMapping
  doDate?: DirectPropertyMapping
}

/**
 * Type guards for property mapping types
 */
export function isEnumToBooleanMapping(
  mapping: PropertyMappingType
): mapping is EnumToBooleanMapping {
  return mapping.mappingType === 'enum_to_boolean'
}

export function isCheckboxMapping(
  mapping: PropertyMappingType
): mapping is CheckboxPropertyMapping {
  return mapping.mappingType === 'checkbox'
}

export function isDirectMapping(
  mapping: PropertyMappingType
): mapping is DirectPropertyMapping {
  return mapping.mappingType === 'direct'
}

/**
 * Factory functions to create mappings
 */
export function createDirectMapping(
  notionPropertyId: string,
  sourceType: PropertyDefinition['type'],
  propertyName: string
): DirectPropertyMapping {
  return {
    mappingType: 'direct',
    notionPropertyId,
    sourceType,
    propertyName,
  }
}

export function createEnumToBooleanMapping(
  notionPropertyId: string,
  sourceType: 'status' | 'select',
  propertyName: string,
  trueOption: OptionDefinition,
  falseOption: OptionDefinition
): EnumToBooleanMapping {
  return {
    mappingType: 'enum_to_boolean',
    notionPropertyId,
    sourceType,
    propertyName,
    trueOption,
    falseOption,
  }
}

export function createCheckboxMapping(
  notionPropertyId: string,
  propertyName: string
): CheckboxPropertyMapping {
  return {
    mappingType: 'checkbox',
    notionPropertyId,
    sourceType: 'checkbox',
    propertyName,
  }
}
