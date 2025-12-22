/**
 * @file src/lib/config/base-config.ts
 * @description Base configuration class with file system operations
 */

import {
  exists,
  BaseDirectory,
  readFile,
  writeTextFile,
  mkdir,
} from '@tauri-apps/plugin-fs'

export interface ConfigOptions {
  baseDir: (typeof BaseDirectory)[keyof typeof BaseDirectory]
  fileName: string
}

export abstract class BaseConfig<T> {
  protected data: T
  protected location: string
  protected options: ConfigOptions

  constructor(data: T, location: string, options: ConfigOptions) {
    this.data = data
    this.location = location
    this.options = options
  }

  /**
   * Get the configuration data
   */
  getData(): T {
    return this.data
  }

  /**
   * Update the configuration data
   */
  setData(data: Partial<T>): void {
    this.data = { ...this.data, ...data }
  }

  /**
   * Save configuration to file
   */
  async save(): Promise<void> {
    if (!this.location || this.location === 'in-memory') {
      console.warn('Config location not set, skipping save')
      return
    }

    const configText = this.serialize()
    await writeTextFile(this.location, configText, {
      baseDir: this.options.baseDir,
    })
  }

  /**
   * Serialize configuration to JSON string
   */
  protected serialize(): string {
    return JSON.stringify(this.data, this.replacer, 2)
  }

  /**
   * Custom JSON replacer for serialization
   */
  protected replacer(key: string, value: unknown): unknown {
    return value
  }

  /**
   * Custom JSON reviver for deserialization
   */
  protected static reviver(key: string, value: unknown): unknown {
    return value
  }

  /**
   * Load configuration from file system
   */
  protected static async loadFromFile<T>(
    fileName: string,
    baseDir: (typeof BaseDirectory)[keyof typeof BaseDirectory],
    defaultData: T,
    reviver?: (key: string, value: unknown) => unknown
  ): Promise<{ data: T; location: string }> {
    const fsOptions = { baseDir }
    const textDecoder = new TextDecoder('utf-8')

    try {
      if (await exists(fileName, fsOptions)) {
        const fileContents = await readFile(fileName, fsOptions)
        const configText = textDecoder.decode(fileContents)
        const data = JSON.parse(configText, reviver) as T
        return { data, location: fileName }
      }
    } catch (error) {
      console.warn(`Error reading config file ${fileName}:`, error)
    }

    // Create default config
    try {
      if (!(await exists('', fsOptions))) {
        await mkdir('', { recursive: true, ...fsOptions })
      }
      await writeTextFile(
        fileName,
        JSON.stringify(defaultData, null, 2),
        fsOptions
      )
    } catch (error) {
      console.warn(`Error creating default config file ${fileName}:`, error)
    }

    return { data: defaultData, location: fileName }
  }
}
