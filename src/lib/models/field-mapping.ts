/**
 * @file src/lib/models/field-mapping.ts
 * @description Field mapping models that preserve Notion field type information
 *
 * This is the core of the mapping system. Unlike a pure adapter pattern,
 * we preserve the underlying Notion field type information so that UI
 * components can react to specific field types (e.g., showing a status
 * dropdown vs a checkbox for the completed field).
 */

import type { PropertyDefinition, Property, OptionDefinition } from '$lib/types'

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
 * Type guard to check if a mapping is enum to boolean
 */
export function isEnumToBooleanMapping(
  mapping: PropertyMappingType
): mapping is EnumToBooleanMapping {
  return mapping.mappingType === 'enum_to_boolean'
}

/**
 * Type guard to check if a mapping is a checkbox
 */
export function isCheckboxMapping(
  mapping: PropertyMappingType
): mapping is CheckboxPropertyMapping {
  return mapping.mappingType === 'checkbox'
}

/**
 * Type guard to check if a mapping is direct
 */
export function isDirectMapping(
  mapping: PropertyMappingType
): mapping is DirectPropertyMapping {
  return mapping.mappingType === 'direct'
}

/**
 * Creates a direct property mapping
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

/**
 * Creates an enum to boolean mapping
 */
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

/**
 * Creates a checkbox property mapping
 */
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
