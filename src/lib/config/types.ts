/**
 * @file src/lib/config/types.ts
 * @description Type definitions for configuration system
 */

import type { FieldMappings } from '$lib/models/field-mapping'

export type ThemeStyle =
  | 'default'
  | 'neumorphism'
  | 'skeuomorphism'
  | 'flat'
  | 'material'
  | 'glassmorphism'

/**
 * Configuration for a single data source (Notion database)
 */
export interface DataSourceConfig {
  id: string
  name: string
  fieldMappings: FieldMappings
  taskLists: TaskListDefinition[]
  lastSyncedAt?: string
}

/**
 * UI Configuration stored in ui_config.json
 */
export interface UIConfigData {
  version: number
  theme: {
    style: ThemeStyle
    colorScheme: 'light' | 'dark' | 'system'
    accentColor?: string
  }
  sidebar: {
    collapsed: boolean
    width: number
  }
  display: {
    compactMode: boolean
    showCompletedTasks: boolean
    sortOrder: 'manual' | 'dueDate' | 'priority' | 'alphabetical'
  }
}

/**
 * Data Source Configuration stored in data_sources.json
 */
export interface DataSourceConfigData {
  version: number
  defaultDataSourceId: string | null
  dataSources: Record<string, DataSourceConfig>
}

/**
 * Filter definition for task lists
 */
export interface TaskListFilter {
  type: 'category' | 'status' | 'date' | 'priority' | 'custom'
  field: string // Property ID in Notion
  operator:
    | 'equals'
    | 'contains'
    | 'before'
    | 'after'
    | 'is_empty'
    | 'is_not_empty'
  value?: string | string[] | boolean | Date
}

/**
 * Task list definition (custom or system)
 */
export interface TaskListDefinition {
  id: string
  name: string
  icon: string
  type: 'system' | 'custom'
  filters: TaskListFilter[]
  sortOrder?: number
}

/**
 * Default system task lists
 */
export const DEFAULT_SYSTEM_LISTS: TaskListDefinition[] = [
  {
    id: 'my-day',
    name: 'My Day',
    icon: '☀️',
    type: 'system',
    filters: [
      {
        type: 'date',
        field: '__doDate__', // Will be resolved to actual property ID
        operator: 'equals',
        value: 'today',
      },
    ],
  },
  {
    id: 'important',
    name: 'Important',
    icon: '⭐',
    type: 'system',
    filters: [
      {
        type: 'priority',
        field: '__priority__',
        operator: 'is_not_empty',
      },
    ],
  },
  {
    id: 'planned',
    name: 'Planned',
    icon: '📅',
    type: 'system',
    filters: [
      {
        type: 'date',
        field: '__dueDate__',
        operator: 'is_not_empty',
      },
    ],
  },
  {
    id: 'all',
    name: 'All Tasks',
    icon: '✅',
    type: 'system',
    filters: [],
  },
]
