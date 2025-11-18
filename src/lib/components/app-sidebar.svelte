<script lang="ts" module>
  // sample data
  const data = {
    mainLists: [
      {
        title: 'My Day',
        url: 'my-day',
        icon: '☀️',
      },
      {
        title: 'Important',
        url: 'important',
        icon: '⭐',
      },
      {
        title: 'Planned',
        url: 'planned',
        icon: '📅',
      },
      {
        title: 'Tasks',
        url: 'default',
        icon: '✅',
      },
    ],
  }
</script>

<script lang="ts">
  import { getMappingContext } from '$lib/contexts/mapping'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import NotionDbSwitcher from './notion-db-switcher.svelte'
  import type { DataSourceObjectResponse } from '@notionhq/client'

  interface Props {
    dataSources: DataSourceObjectResponse[]
    selectedDataSourceId: string
  }
  let { dataSources, selectedDataSourceId }: Props = $props()

  let selectedDataSource = $derived.by(() =>
    dataSources.find((ds) => ds.id === selectedDataSourceId)
  )

  let mapping = getMappingContext()
  let categoryPropertyId = $derived(
    mapping.propertyMappings['category']?.notionPropertyId
  )

  let categories = $derived.by(() => {
    if (!selectedDataSource || !categoryPropertyId) return []

    let categoryProperty = Object.values(selectedDataSource.properties).find(
      (prop) => prop.id === categoryPropertyId
    )

    if (
      !categoryProperty ||
      categoryProperty.type !== 'select' ||
      !categoryProperty.select.options
    ) {
      return []
    }

    return categoryProperty.select.options
  })

  $inspect('categories', categories)
</script>

<Sidebar.Root variant="floating">
  <Sidebar.Header>
    <NotionDbSwitcher {dataSources} {selectedDataSourceId} />
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.Menu class="gap-2">
        {#each data.mainLists as item (item.title)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href={item.url} class="font-medium" {...props}>
                  {item.title}
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    </Sidebar.Group>
    <Sidebar.Separator />
    <Sidebar.Group>
      <Sidebar.Menu class="gap-2">
        {#each categories as category (category.id)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href={category.id} class="font-medium" {...props}>
                  {category.name}
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    </Sidebar.Group>
  </Sidebar.Content>
</Sidebar.Root>
