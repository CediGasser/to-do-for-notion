import type {
  DataSourceObjectResponse,
  PageObjectResponse,
} from '@notionhq/client'

export interface SimpleTask {
  id: string
  title: string
  completed: boolean
  category?: string
  dueDate?: Date
  priority?: string
  doDate?: Date
}

export type Property = PageObjectResponse['properties'][string]

export type PropertyDefinition =
  DataSourceObjectResponse['properties'][keyof DataSourceObjectResponse['properties']]

export type SelectColor =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
