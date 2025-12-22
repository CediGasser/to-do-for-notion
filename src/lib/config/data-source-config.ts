/**
 * @file src/lib/config/data-source-config.ts
 * @description Data source (Notion DB) configuration management
 */

import { BaseDirectory } from '@tauri-apps/plugin-fs'
import { BaseConfig } from './base-config'
import type {
  DataSourceConfigData,
  TaskListDefinition,
  DataSourceConfig,
} from './types'
import type { FieldMappings } from '$lib/models/field-mapping'

const DEFAULT_CONFIG: DataSourceConfigData = {
  version: 1,
  defaultDataSourceId: null,
  dataSources: {},
}

export class DataSourceConfigManager extends BaseConfig<DataSourceConfigData> {
  private static instance: DataSourceConfigManager | null = null

  private constructor(data: DataSourceConfigData, location: string) {
    super(data, location, {
      baseDir: BaseDirectory.AppConfig,
      fileName: 'data_sources.json',
    })
  }

  /**
   * Get the singleton instance
   */
  static async getInstance(): Promise<DataSourceConfigManager> {
    if (!DataSourceConfigManager.instance) {
      const { data, location } =
        await BaseConfig.loadFromFile<DataSourceConfigData>(
          'data_sources.json',
          BaseDirectory.AppConfig,
          DEFAULT_CONFIG,
          DataSourceConfigManager.reviver
        )
      DataSourceConfigManager.instance = new DataSourceConfigManager(
        data,
        location
      )
    }
    return DataSourceConfigManager.instance
  }

  /**
   * Create an in-memory instance for testing
   */
  static createInMemory(
    data: Partial<DataSourceConfigData> = {}
  ): DataSourceConfigManager {
    return new DataSourceConfigManager(
      { ...DEFAULT_CONFIG, ...data },
      'in-memory'
    )
  }

  /**
   * Custom reviver to restore class instances
   */
  protected static reviver(key: string, value: unknown): unknown {
    // Restore Date objects
    if (typeof value === 'string' && key === 'lastSyncedAt') {
      return value // Keep as string, parse when needed
    }
    return value
  }

  // Data source management
  get defaultDataSourceId(): string | null {
    return this.data.defaultDataSourceId
  }

  set defaultDataSourceId(id: string | null) {
    this.data.defaultDataSourceId = id
  }

  /**
   * Get all configured data sources
   */
  getAllDataSources(): DataSourceConfig[] {
    return Object.values(this.data.dataSources)
  }

  /**
   * Get a specific data source configuration
   */
  getDataSource(id: string): DataSourceConfig | null {
    return this.data.dataSources[id] ?? null
  }

  /**
   * Add or update a data source configuration
   */
  setDataSource(config: DataSourceConfig): void {
    this.data.dataSources[config.id] = config
  }

  /**
   * Remove a data source configuration
   */
  removeDataSource(id: string): boolean {
    if (this.data.dataSources[id]) {
      delete this.data.dataSources[id]
      if (this.data.defaultDataSourceId === id) {
        this.data.defaultDataSourceId = null
      }
      return true
    }
    return false
  }

  /**
   * Get task lists for a data source
   */
  getTaskLists(dataSourceId: string): TaskListDefinition[] {
    const ds = this.getDataSource(dataSourceId)
    return ds?.taskLists ?? []
  }

  /**
   * Update task lists for a data source
   */
  setTaskLists(dataSourceId: string, lists: TaskListDefinition[]): void {
    const ds = this.getDataSource(dataSourceId)
    if (ds) {
      ds.taskLists = lists
    }
  }

  /**
   * Add a custom task list to a data source
   */
  addTaskList(dataSourceId: string, list: TaskListDefinition): void {
    const ds = this.getDataSource(dataSourceId)
    if (ds) {
      ds.taskLists.push(list)
    }
  }

  /**
   * Get field mappings for a data source
   */
  getFieldMappings(dataSourceId: string): FieldMappings | null {
    const ds = this.getDataSource(dataSourceId)
    return ds?.fieldMappings ?? null
  }

  /**
   * Update field mappings for a data source
   */
  setFieldMappings(dataSourceId: string, mappings: FieldMappings): void {
    const ds = this.getDataSource(dataSourceId)
    if (ds) {
      ds.fieldMappings = mappings
    }
  }
}
