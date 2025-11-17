/**
 * @file src/lib/config.ts
 * @description Methods and classes for configuring data source mappings
 */

import {
  exists,
  BaseDirectory,
  readFile,
  create,
  writeTextFile,
  mkdir,
} from '@tauri-apps/plugin-fs'
import {
  PropertyMapping,
  EnumToBooleanPropertyMapping,
  DataSourceMapping,
} from './abstraction/mapping.svelte'

type AppConfig = {
  defaultDataSourceId: string | null
  dataSourceMappings: Record<string, DataSourceMapping>
}

const FS_OPTIONS = { baseDir: BaseDirectory.AppConfig }
const DEFAULT_CONFIG = `{
  "defaultDataSourceId": null,
  "dataSourceMappings": {} 

}`

export class Config {
  public defaultDataSourceId: string | null = null
  public dataSourceMappings: Record<string, DataSourceMapping>

  private location: string

  constructor(config: string, location: string) {
    let parsed: AppConfig
    try {
      parsed = JSON.parse(config, this.reviver)
    } catch (error) {
      console.error('Error parsing config file:', error)
      throw new Error('Invalid config file format')
    }

    console.log('Loaded config:', parsed)

    this.defaultDataSourceId = parsed.defaultDataSourceId
    this.dataSourceMappings = parsed.dataSourceMappings

    this.location = location
  }

  toJSON = (): string => {
    const config: AppConfig = {
      defaultDataSourceId: this.defaultDataSourceId,
      dataSourceMappings: this.dataSourceMappings,
    }
    return JSON.stringify(config, null, 2)
  }

  public save = async (): Promise<void> => {
    // Don't save if location is not set or 'in-memory' config
    if (!this.location || this.location === 'in-memory') {
      console.warn('Config location not set, skipping save')
      return
    }

    const configText = this.toJSON()

    await writeTextFile(this.location, configText, FS_OPTIONS)
  }

  private reviver = (key: string, value: any): any => {
    if (value && value.__type) {
      switch (value.__type) {
        case 'PropertyMapping':
          return new PropertyMapping(value.notionPropertyId)
        case 'EnumToBooleanPropertyMapping':
          return new EnumToBooleanPropertyMapping(
            value.notionPropertyId,
            value.trueValueId,
            value.falseValueId
          )
        case 'DataSourceMapping':
          return new DataSourceMapping(value.propertyMappings)
        default:
          return value
      }
    }
    return value
  }

  static fromDefaultFile = async (): Promise<Config> => {
    // Try to read from default locations in this order
    const configFileNames = ['app_config.json', 'config.json']

    const textDecoder = new TextDecoder('utf-8')

    for (const fileName of configFileNames) {
      if (await exists(fileName, FS_OPTIONS)) {
        const fileContents = await readFile(fileName, FS_OPTIONS)
        const configText = textDecoder.decode(fileContents)
        return new Config(configText, fileName)
      }
    }

    // If no config file found, create empty config
    // Check if parent directory exists, if not create it
    if (!(await exists('', FS_OPTIONS))) {
      await mkdir('', { recursive: true, ...FS_OPTIONS })
    }

    const file = await create(configFileNames[0], FS_OPTIONS)
    file.write(new TextEncoder().encode(DEFAULT_CONFIG))
    file.close()

    console.log(
      'No config file found, created default config at',
      configFileNames[0]
    )

    return new Config(DEFAULT_CONFIG, configFileNames[0])
  }
}

const config = await Config.fromDefaultFile()

export default config
