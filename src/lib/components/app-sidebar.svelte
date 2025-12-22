<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import NotionDbSwitcher from './notion-db-switcher.svelte'
  import { syncStore } from '$lib/stores/sync-state.svelte'
  import type { DataSourceObjectResponse } from '@notionhq/client'
  import type { TaskListDefinition } from '$lib/config/types'
  import { DEFAULT_SYSTEM_LISTS } from '$lib/config/types'
  import SettingsIcon from '@lucide/svelte/icons/settings-2'

  interface Props {
    dataSources: DataSourceObjectResponse[]
    selectedDataSourceId: string
    taskLists?: TaskListDefinition[]
  }
  let { dataSources, selectedDataSourceId, taskLists = [] }: Props = $props()

  // Separate system lists and custom lists
  let systemLists = $derived(
    taskLists.filter((list) => list.type === 'system').length > 0
      ? taskLists.filter((list) => list.type === 'system')
      : DEFAULT_SYSTEM_LISTS
  )

  let customLists = $derived(taskLists.filter((list) => list.type === 'custom'))
</script>

<Sidebar.Root variant="floating">
  <Sidebar.Header>
    <NotionDbSwitcher {dataSources} {selectedDataSourceId} />
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.Menu class="gap-2">
        {#each systemLists as list (list.id)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href={list.id} class="font-medium" {...props}>
                  <span class="mr-2">{list.icon}</span>
                  {list.name}
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    </Sidebar.Group>
    {#if customLists.length > 0}
      <Sidebar.Separator />
      <Sidebar.Group>
        <Sidebar.GroupLabel>Lists</Sidebar.GroupLabel>
        <Sidebar.Menu class="gap-2">
          {#each customLists as list (list.id)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                {#snippet child({ props })}
                  <a href={list.id} class="font-medium" {...props}>
                    <span class="mr-2">{list.icon}</span>
                    {list.name}
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.Group>
    {/if}
  </Sidebar.Content>
  <Sidebar.Footer>
    <Sidebar.Menu>
      <Sidebar.MenuItem class="flex flex-row justify-center items-center">
        <Sidebar.MenuButton>
          {#snippet child({ props })}
            <a href="/configure" class="font-medium" {...props}>
              <SettingsIcon size="4" />
            </a>
          {/snippet}
        </Sidebar.MenuButton>
        {#if syncStore.isSyncing}
          <div
            class="flex justify-center items-center gap-2 text-muted-foreground"
          >
            <div
              class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
            ></div>
            <span class="text-sm">Syncing...</span>
          </div>
        {/if}
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>
</Sidebar.Root>
