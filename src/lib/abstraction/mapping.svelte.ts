import type { SimpleTask, PropertyDefinition, Property } from '$lib/types'
import type {
  DataSourceObjectResponse,
  PageObjectResponse,
} from '@notionhq/client'

export const mappings = new Map<string, DataSourceMapping>()

export const registerMapping = (
  dataSourceId: string,
  mapping: DataSourceMapping
): void => {
  mappings.set(dataSourceId, mapping)
}

export const getMappingForDataSource = (
  dataSourceId: string
): DataSourceMapping | null => {
  return mappings.get(dataSourceId) || null
}

class PropertyMapping {
  public notionPropertyDefinition: PropertyDefinition

  constructor(notionPropertyDefinition: PropertyDefinition) {
    this.notionPropertyDefinition = notionPropertyDefinition
  }

  public toString = (): string => {
    if (!this.notionPropertyDefinition) {
      return 'Not mapped'
    }

    return `${this.notionPropertyDefinition.name} (${this.notionPropertyDefinition.type})`
  }
}

export class DataSourceMapping {
  public dataSource: DataSourceObjectResponse | null = $state(null)

  public titleProperty: PropertyDefinition | null = $state(null)
  public completedProperty: PropertyDefinition | null = $state(null)
  public categoryProperty: PropertyDefinition | null = $state(null)
  public dueDateProperty: PropertyDefinition | null = $state(null)
  public priorityProperty: PropertyDefinition | null = $state(null)
  public doDateProperty: PropertyDefinition | null = $state(null)

  // A mapping is valid if at least the title and completed properties are set
  public isValidMapping = $derived(this.titleProperty && this.completedProperty)

  public getMappedProperty = (
    propertyName: keyof Omit<SimpleTask, 'id'>,
    notionPage: PageObjectResponse
  ): Property => {
    switch (propertyName) {
      case 'title':
        return notionPage.properties[this.titleProperty?.name || '']
      case 'completed':
        return notionPage.properties[this.completedProperty?.name || '']
      case 'category':
        return notionPage.properties[this.categoryProperty?.name || '']
      case 'dueDate':
        return notionPage.properties[this.dueDateProperty?.name || '']
      case 'priority':
        return notionPage.properties[this.priorityProperty?.name || '']
      case 'doDate':
        return notionPage.properties[this.doDateProperty?.name || '']
      default:
        throw new Error(`Unknown property name: ${propertyName}`)
    }
  }

  // Mapping methods for two way conversion between SimpleTask and Notion properties
  public fromNotion = (notionPage: PageObjectResponse): SimpleTask => {
    const getPropertyValue = (property: PropertyDefinition | null) => {
      if (!property) {
        return null
      }

      return (notionPage.properties[property.name] as any)[property.type]
    }

    return {
      id: notionPage.id,
      title: getPropertyValue(this.titleProperty)?.[0].plain_text || '',
      completed:
        getPropertyValue(this.completedProperty)?.name === 'Done' || false,
      category: getPropertyValue(this.categoryProperty)?.[0].name || '',
      dueDate: getPropertyValue(this.dueDateProperty)?.start || '',
      priority: getPropertyValue(this.priorityProperty)?.name || '',
      doDate: getPropertyValue(this.doDateProperty)?.start || '',
    }
  }

  // Get possible properties for a given SimpleTask property
  getPossiblePropertiesFor(
    propertyName: keyof Omit<SimpleTask, 'id'>
  ): PropertyDefinition[] {
    if (!this.dataSource) {
      return []
    }

    const propertyTypeMap: Record<
      keyof Omit<SimpleTask, 'id'>,
      PropertyDefinition['type'][]
    > = {
      title: ['title'],
      completed: ['checkbox', 'status'],
      category: ['select', 'multi_select', 'rich_text'],
      dueDate: ['date'],
      priority: ['select', 'number', 'rich_text'],
      doDate: ['date'],
    }

    const desiredTypes = propertyTypeMap[propertyName]

    return Object.entries(this.dataSource.properties)
      .filter(([_, prop]) => desiredTypes.includes(prop.type))
      .map(([_, prop]) => prop)
  }
}
