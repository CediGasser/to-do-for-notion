<script lang="ts">
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import CheckIcon from '@lucide/svelte/icons/check'
  import CheckCheckIcon from '@lucide/svelte/icons/check-check'
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down'
  import type { DataSourceObjectResponse } from '@notionhq/client'

  interface Props {
    dataSources: DataSourceObjectResponse[]
    selectedDataSourceId: string
  }

  let { dataSources, selectedDataSourceId = $bindable() }: Props = $props()

  let selectedDataSource = $derived.by(() =>
    dataSources.find((ds) => ds.id === selectedDataSourceId)
  )
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            {...props}
          >
            <div
              class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
            >
              <CheckCheckIcon class="size-4" />
            </div>
            <div class="flex flex-col gap-0.5 leading-none">
              <span class="font-medium">To Do for Notion</span>
              <span class=""
                >{selectedDataSource?.title[0]?.plain_text || 'Untitled'}</span
              >
            </div>
            <ChevronsUpDownIcon class="ml-auto" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-(--bits-dropdown-menu-anchor-width)"
        align="start"
      >
        {#each dataSources as dataSource (dataSource)}
          <DropdownMenu.Item
            onSelect={() => (selectedDataSourceId = dataSource.id)}
          >
            {dataSource.title[0]?.plain_text || 'Untitled'}
            {#if dataSource.id === selectedDataSourceId}
              <CheckIcon class="ml-auto" />
            {/if}
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
