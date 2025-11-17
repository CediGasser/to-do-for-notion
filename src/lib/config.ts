/**
 * @file src/lib/config.ts
 * @description Methods and classes for configuring data source mappings
 */

type AppConfig = {
  defaultDataSourceId: string | null
  dataSourceMappings: Record<string, any>
}
