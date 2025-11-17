import type {
  OptionDefinition,
  SimpleTask,
  PropertyDefinition,
  Property,
} from '$lib/types'
import type {
  DataSourceObjectResponse,
  PageObjectResponse,
} from '@notionhq/client'
import { createContext } from 'svelte'

export const [getMappingContext, setMappingContext] =
  createContext<DataSourceMapping>()

export class PropertyMapping {
  public notionPropertyId: string

  constructor(notionPropertyId: string) {
    this.notionPropertyId = notionPropertyId
  }

  toJSON = (): any => {
    return {
      __type: 'PropertyMapping',
      notionPropertyId: this.notionPropertyId,
    }
  }
}

export class EnumToBooleanPropertyMapping extends PropertyMapping {
  public trueValueId: string
  public falseValueId: string

  constructor(
    notionPropertyId: string,
    trueValueId: string,
    falseValueId: string
  ) {
    super(notionPropertyId)
    this.trueValueId = trueValueId
    this.falseValueId = falseValueId
  }

  toJSON = (): any => {
    return {
      __type: 'EnumToBooleanPropertyMapping',
      notionPropertyId: this.notionPropertyId,
      trueValueId: this.trueValueId,
      falseValueId: this.falseValueId,
    }
  }
}

export class DataSourceMapping {
  public propertyMappings: Record<string, PropertyMapping> = {}

  constructor(propertyMappings: Record<string, PropertyMapping>) {
    this.propertyMappings = propertyMappings
  }

  public getPropertyFor = (
    propertyName: keyof Omit<SimpleTask, 'id'>,
    notionPage: PageObjectResponse
  ): Property | null => {
    const propertyMapping = this.propertyMappings[propertyName]
    if (!propertyMapping) {
      return null
    }

    // The key in notionPage.properties is not the property ID, so we need to find it by ID
    return Object.values(notionPage.properties).find(
      (prop) => prop.id === propertyMapping.notionPropertyId
    ) as Property | null
  }

  toJSON = (): any => {
    return {
      __type: 'DataSourceMapping',
      propertyMappings: this.propertyMappings,
    }
  }
}

export class DataSourceMappingBuilder {
  public dataSource: DataSourceObjectResponse | null = $state(null)

  public titleProperty: PropertyDefinition | null = $state(null)
  public completedProperty: PropertyDefinition | null = $state(null)
  public categoryProperty: PropertyDefinition | null = $state(null)
  public dueDateProperty: PropertyDefinition | null = $state(null)
  public priorityProperty: PropertyDefinition | null = $state(null)
  public doDateProperty: PropertyDefinition | null = $state(null)

  public completedEnumTrueOption: OptionDefinition | null = $state(null)
  public completedEnumFalseOption: OptionDefinition | null = $state(null)

  // A mapping is valid if at least the title and completed properties are set
  public isValidMapping = $derived.by(() => {
    const mandatoryPropertiesExist =
      this.titleProperty !== null && this.completedProperty !== null

    const dataSourceExists = this.dataSource !== null

    const completedPropertyValid =
      this.completedProperty?.type !== 'status' ||
      (this.completedEnumTrueOption !== null &&
        this.completedEnumFalseOption !== null)

    const completedPropertyOptionsNotEqual =
      this.completedProperty?.type !== 'status' ||
      this.completedEnumTrueOption?.id !== this.completedEnumFalseOption?.id

    return (
      mandatoryPropertiesExist &&
      dataSourceExists &&
      completedPropertyValid &&
      completedPropertyOptionsNotEqual
    )
  })

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

  getPossibleEnumsFor(
    property: PropertyDefinition
  ): { id: string; name: string }[] {
    if (property.type !== 'status' && property.type !== 'select') {
      return []
    }

    const options =
      property.type === 'status'
        ? property.status?.options || []
        : property.select?.options || []

    return options.map((option) => ({ id: option.id, name: option.name }))
  }

  buildMapping(): DataSourceMapping {
    if (!this.isValidMapping) {
      throw new Error('Cannot build mapping: mapping is not valid')
    }

    const propertyMappings: Record<string, PropertyMapping> = {}

    if (this.titleProperty) {
      propertyMappings['title'] = new PropertyMapping(this.titleProperty.id)
    }

    if (this.completedProperty) {
      if (this.completedProperty.type === 'status') {
        propertyMappings['completed'] = new EnumToBooleanPropertyMapping(
          this.completedProperty.id,
          this.completedEnumTrueOption?.id!,
          this.completedEnumFalseOption?.id!
        )
      } else {
        propertyMappings['completed'] = new PropertyMapping(
          this.completedProperty.id
        )
      }
    }

    if (this.categoryProperty) {
      propertyMappings['category'] = new PropertyMapping(
        this.categoryProperty.id
      )
    }

    if (this.dueDateProperty) {
      propertyMappings['dueDate'] = new PropertyMapping(this.dueDateProperty.id)
    }

    if (this.priorityProperty) {
      propertyMappings['priority'] = new PropertyMapping(
        this.priorityProperty.id
      )
    }

    if (this.doDateProperty) {
      propertyMappings['doDate'] = new PropertyMapping(this.doDateProperty.id)
    }

    return new DataSourceMapping(propertyMappings)
  }
}
