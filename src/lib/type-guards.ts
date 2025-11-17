import type { RichTextItemResponse } from '@notionhq/client'
import type { Property, SelectColor } from '$lib/types'

type CheckboxProperty = {
  type: 'checkbox'
  checkbox: boolean
  id: string
}

export function isCheckboxProperty(
  property: Property
): property is CheckboxProperty {
  return property.type === 'checkbox'
}

type StatusProperty = {
  type: 'status'
  status: {
    name: string
    id: string
    color: SelectColor
  }
  id: string
}

export function isStatusProperty(
  property: Property
): property is StatusProperty {
  return property.type === 'status'
}

type TitleProperty = {
  type: 'title'
  title: Array<RichTextItemResponse>
  id: string
}

export function isTitleProperty(property: Property): property is TitleProperty {
  return property.type === 'title'
}
