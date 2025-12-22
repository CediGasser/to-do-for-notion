/**
 * @file src/lib/stores/index.ts
 * @description Store exports
 */

export {
  syncStore,
  type SyncOperation,
  type SyncState,
} from './sync-state.svelte'
export { taskStore } from './tasks.svelte'
export { uiConfigStore, dataSourceConfigStore } from './config.svelte'
