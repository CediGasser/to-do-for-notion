import { describe, it, expect } from 'vitest'
import { Config } from '../lib/config'

describe('Config parses correctly from JSON', () => {
  it('parses config with defaultDataSourceId and dataSourceMappings', () => {
    const json = `{
      "defaultDataSourceId": "ds_123",
      "dataSourceMappings": {
        "ds_123": {}
      }
    }`

    const config = new Config(json, 'in-memory')

    expect(config.defaultDataSourceId).toBe('ds_123')
    expect(config.dataSourceMappings).toHaveProperty('ds_123')
  })

  it('parses config with null defaultDataSourceId', () => {
    const json = `{
      "defaultDataSourceId": null,
      "dataSourceMappings": {}
    }`

    const config = new Config(json, 'in-memory')

    expect(config.defaultDataSourceId).toBeNull()
    expect(config.dataSourceMappings).toEqual({})
  })
})

describe('Config serializes correctly to JSON', () => {
  it('serializes config with defaultDataSourceId and dataSourceMappings', () => {
    const json = `{
      "defaultDataSourceId": "ds_123",
      "dataSourceMappings": {
        "ds_123": {}
      }
    }`

    const config = new Config(json, 'in-memory')
    const serialized = config.toJSON()

    const expected = JSON.stringify(
      {
        defaultDataSourceId: 'ds_123',
        dataSourceMappings: {
          ds_123: {},
        },
      },
      null,
      2
    )

    expect(serialized).toBe(expected)
  })

  it('serializes config with null defaultDataSourceId', () => {
    const json = `{
      "defaultDataSourceId": null,
      "dataSourceMappings": {}
    }`

    const config = new Config(json, 'in-memory')
    const serialized = config.toJSON()

    const expected = JSON.stringify(
      {
        defaultDataSourceId: null,
        dataSourceMappings: {},
      },
      null,
      2
    )

    expect(serialized).toBe(expected)
  })
})
