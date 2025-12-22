/**
 * @file src/lib/config/ui-config.ts
 * @description UI configuration management (themes, display settings)
 */

import { BaseDirectory } from '@tauri-apps/plugin-fs'
import { BaseConfig } from './base-config'
import type { UIConfigData, ThemeStyle } from './types'

const DEFAULT_UI_CONFIG: UIConfigData = {
  version: 1,
  theme: {
    style: 'default',
    colorScheme: 'system',
  },
  sidebar: {
    collapsed: false,
    width: 280,
  },
  display: {
    compactMode: false,
    showCompletedTasks: true,
    sortOrder: 'manual',
  },
}

export class UIConfig extends BaseConfig<UIConfigData> {
  private static instance: UIConfig | null = null

  private constructor(data: UIConfigData, location: string) {
    super(data, location, {
      baseDir: BaseDirectory.AppConfig,
      fileName: 'ui_config.json',
    })
  }

  /**
   * Get the singleton instance
   */
  static async getInstance(): Promise<UIConfig> {
    if (!UIConfig.instance) {
      const { data, location } = await BaseConfig.loadFromFile<UIConfigData>(
        'ui_config.json',
        BaseDirectory.AppConfig,
        DEFAULT_UI_CONFIG
      )
      UIConfig.instance = new UIConfig(data, location)
    }
    return UIConfig.instance
  }

  /**
   * Create an in-memory instance for testing
   */
  static createInMemory(data: Partial<UIConfigData> = {}): UIConfig {
    return new UIConfig({ ...DEFAULT_UI_CONFIG, ...data }, 'in-memory')
  }

  // Theme accessors
  get themeStyle(): ThemeStyle {
    return this.data.theme.style
  }

  set themeStyle(style: ThemeStyle) {
    this.data.theme.style = style
  }

  get colorScheme(): 'light' | 'dark' | 'system' {
    return this.data.theme.colorScheme
  }

  set colorScheme(scheme: 'light' | 'dark' | 'system') {
    this.data.theme.colorScheme = scheme
  }

  // Sidebar accessors
  get sidebarCollapsed(): boolean {
    return this.data.sidebar.collapsed
  }

  set sidebarCollapsed(collapsed: boolean) {
    this.data.sidebar.collapsed = collapsed
  }

  get sidebarWidth(): number {
    return this.data.sidebar.width
  }

  set sidebarWidth(width: number) {
    this.data.sidebar.width = width
  }

  // Display accessors
  get compactMode(): boolean {
    return this.data.display.compactMode
  }

  set compactMode(compact: boolean) {
    this.data.display.compactMode = compact
  }

  get showCompletedTasks(): boolean {
    return this.data.display.showCompletedTasks
  }

  set showCompletedTasks(show: boolean) {
    this.data.display.showCompletedTasks = show
  }

  get sortOrder(): UIConfigData['display']['sortOrder'] {
    return this.data.display.sortOrder
  }

  set sortOrder(order: UIConfigData['display']['sortOrder']) {
    this.data.display.sortOrder = order
  }
}
