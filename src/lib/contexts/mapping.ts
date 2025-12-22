import type { FieldMappings } from '$lib/models/field-mapping'
import { createContext } from 'svelte'

/**
 * Context for providing field mappings to child components
 * This allows components to access mapping information for the current data source
 */
export const [getMappingContext, setMappingContext] =
  createContext<FieldMappings>()
