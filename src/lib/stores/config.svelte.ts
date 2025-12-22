/**
 * @file src/lib/stores/config.svelte.ts
 * @description Reactive configuration stores using Svelte 5 runes
 */

import {
  configService,
  UIConfig,
  DataSourceConfigManager,
  type ThemeStyle,
  type UIConfigData,
} from '$lib/config/index'

/**
 * Creates a reactive UI config store
 */
function createUIConfigStore() {
  let uiConfig = $state<UIConfig | null>(null)
  let isInitialized = $state(false)

  // Reactive theme values
  let themeStyle = $state<ThemeStyle>('default')
  let colorScheme = $state<'light' | 'dark' | 'system'>('system')
  let sidebarCollapsed = $state(false)
  let sidebarWidth = $state(280)
  let compactMode = $state(false)
  let showCompletedTasks = $state(true)
  let sortOrder = $state<UIConfigData['display']['sortOrder']>('manual')

  /**
   * Initialize from config service
   */
  async function initialize(): Promise<void> {
    if (isInitialized) return

    await configService.initialize()
    uiConfig = configService.getUIConfig()

    // Sync reactive state
    themeStyle = uiConfig.themeStyle
    colorScheme = uiConfig.colorScheme
    sidebarCollapsed = uiConfig.sidebarCollapsed
    sidebarWidth = uiConfig.sidebarWidth
    compactMode = uiConfig.compactMode
    showCompletedTasks = uiConfig.showCompletedTasks
    sortOrder = uiConfig.sortOrder

    isInitialized = true
  }

  /**
   * Save current state to config file
   */
  async function save(): Promise<void> {
    if (!uiConfig) return

    uiConfig.themeStyle = themeStyle
    uiConfig.colorScheme = colorScheme
    uiConfig.sidebarCollapsed = sidebarCollapsed
    uiConfig.sidebarWidth = sidebarWidth
    uiConfig.compactMode = compactMode
    uiConfig.showCompletedTasks = showCompletedTasks
    uiConfig.sortOrder = sortOrder

    await uiConfig.save()
  }

  /**
   * Set theme style
   */
  function setThemeStyle(style: ThemeStyle): void {
    themeStyle = style
  }

  /**
   * Set color scheme
   */
  function setColorScheme(scheme: 'light' | 'dark' | 'system'): void {
    colorScheme = scheme
  }

  /**
   * Toggle sidebar collapsed state
   */
  function toggleSidebar(): void {
    sidebarCollapsed = !sidebarCollapsed
  }

  /**
   * Set sidebar width
   */
  function setSidebarWidth(width: number): void {
    sidebarWidth = width
  }

  /**
   * Toggle compact mode
   */
  function toggleCompactMode(): void {
    compactMode = !compactMode
  }

  /**
   * Toggle show completed tasks
   */
  function toggleShowCompletedTasks(): void {
    showCompletedTasks = !showCompletedTasks
  }

  /**
   * Set sort order
   */
  function setSortOrder(order: UIConfigData['display']['sortOrder']): void {
    sortOrder = order
  }

  return {
    // Reactive getters
    get isInitialized() {
      return isInitialized
    },
    get themeStyle() {
      return themeStyle
    },
    get colorScheme() {
      return colorScheme
    },
    get sidebarCollapsed() {
      return sidebarCollapsed
    },
    get sidebarWidth() {
      return sidebarWidth
    },
    get compactMode() {
      return compactMode
    },
    get showCompletedTasks() {
      return showCompletedTasks
    },
    get sortOrder() {
      return sortOrder
    },
    // Actions
    initialize,
    save,
    setThemeStyle,
    setColorScheme,
    toggleSidebar,
    setSidebarWidth,
    toggleCompactMode,
    toggleShowCompletedTasks,
    setSortOrder,
  }
}

/**
 * Creates a reactive data source config store
 */
function createDataSourceConfigStore() {
  let config = $state<DataSourceConfigManager | null>(null)
  let isInitialized = $state(false)
  let defaultDataSourceId = $state<string | null>(null)

  /**
   * Initialize from config service
   */
  async function initialize(): Promise<void> {
    if (isInitialized) return

    await configService.initialize()
    config = configService.getDataSourceConfig()
    defaultDataSourceId = config.defaultDataSourceId

    isInitialized = true
  }

  /**
   * Get the config manager (for advanced operations)
   */
  function getConfig(): DataSourceConfigManager | null {
    return config
  }

  /**
   * Set the default data source
   */
  function setDefaultDataSource(id: string | null): void {
    if (config) {
      config.defaultDataSourceId = id
      defaultDataSourceId = id
    }
  }

  /**
   * Save configuration
   */
  async function save(): Promise<void> {
    await config?.save()
  }

  return {
    // Reactive getters
    get isInitialized() {
      return isInitialized
    },
    get defaultDataSourceId() {
      return defaultDataSourceId
    },
    // Actions
    initialize,
    getConfig,
    setDefaultDataSource,
    save,
  }
}

// Export singleton instances
export const uiConfigStore = createUIConfigStore()
export const dataSourceConfigStore = createDataSourceConfigStore()
