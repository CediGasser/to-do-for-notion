/**
 * @file src/lib/config/index.ts
 * @description Configuration service facade
 */

export { UIConfig } from './ui-config'
export { DataSourceConfigManager } from './data-source-config'
export {
  type ThemeStyle,
  type UIConfigData,
  type DataSourceConfigData,
  type DataSourceConfig,
  type TaskListFilter,
  type TaskListDefinition,
  DEFAULT_SYSTEM_LISTS,
} from './types'

import { UIConfig } from './ui-config'
import { DataSourceConfigManager } from './data-source-config'

/**
 * Configuration service that provides access to both UI and data source configs
 */
export class ConfigService {
  private static instance: ConfigService | null = null

  private uiConfig: UIConfig | null = null
  private dataSourceConfig: DataSourceConfigManager | null = null

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  /**
   * Initialize all configurations
   * Call this once at app startup
   */
  async initialize(): Promise<void> {
    const [ui, dataSources] = await Promise.all([
      UIConfig.getInstance(),
      DataSourceConfigManager.getInstance(),
    ])
    this.uiConfig = ui
    this.dataSourceConfig = dataSources
  }

  /**
   * Get UI configuration
   */
  getUIConfig(): UIConfig {
    if (!this.uiConfig) {
      throw new Error('ConfigService not initialized. Call initialize() first.')
    }
    return this.uiConfig
  }

  /**
   * Get data source configuration
   */
  getDataSourceConfig(): DataSourceConfigManager {
    if (!this.dataSourceConfig) {
      throw new Error('ConfigService not initialized. Call initialize() first.')
    }
    return this.dataSourceConfig
  }

  /**
   * Save all configurations
   */
  async saveAll(): Promise<void> {
    await Promise.all([this.uiConfig?.save(), this.dataSourceConfig?.save()])
  }
}

// Export singleton accessor
export const configService = ConfigService.getInstance()
