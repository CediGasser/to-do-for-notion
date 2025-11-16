import type { SimpleTask } from '$lib/types'
import type { DataSourceObjectResponse } from '@notionhq/client'

type PropertyType =
  DataSourceObjectResponse['properties'][keyof DataSourceObjectResponse['properties']]

class PropertyMapping {
  public notionPropertyDefinition: PropertyType

  constructor(notionPropertyDefinition: PropertyType) {
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

  public titleProperty: PropertyType | null = $state(null)
  public completedProperty: PropertyType | null = $state(null)
  public categoryProperty: PropertyType | null = $state(null)
  public dueDateProperty: PropertyType | null = $state(null)
  public priorityProperty: PropertyType | null = $state(null)
  public doDateProperty: PropertyType | null = $state(null)

  // A mapping is valid if at least the title and completed properties are set
  public isValidMapping = $derived(this.titleProperty && this.completedProperty)

  getPossiblePropertiesFor(
    propertyName: keyof Omit<SimpleTask, 'id'>
  ): PropertyType[] {
    if (!this.dataSource) {
      return []
    }

    const propertyTypeMap: Record<
      keyof Omit<SimpleTask, 'id'>,
      PropertyType['type'][]
    > = {
      title: ['title', 'rich_text'],
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
