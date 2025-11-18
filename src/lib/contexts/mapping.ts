import type { DataSourceMapping } from '$lib/abstraction/mapping.svelte'
import { createContext } from 'svelte'

export const [getMappingContext, setMappingContext] =
  createContext<DataSourceMapping>()
