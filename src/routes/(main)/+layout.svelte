<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { Separator } from '$lib/components/ui/separator'
  import AppSidebar from '$lib/components/app-sidebar.svelte'

  let { children } = $props()

  let listName = 'Tasks'
</script>

<Sidebar.Provider style="--sidebar-width: 19rem;">
  <AppSidebar />
  <Sidebar.Inset>
    <header class="flex h-16 shrink-0 items-center gap-2 px-4">
      <Sidebar.Trigger class="-ml-1" />
      <Separator
        orientation="vertical"
        class="mr-2 data-[orientation=vertical]:h-4"
      />
      <h2 class="text-2xl font-bold">{listName}</h2>
    </header>
    <main class="flex flex-1 flex-col gap-4 p-4 pt-0">
      {@render children?.()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
