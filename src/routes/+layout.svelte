<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb'
  import { Separator } from '$lib/components/ui/separator'
  import AppSidebar from '$lib/components/app-sidebar.svelte'

  import '../app.css'

  let { children } = $props()
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
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item class="hidden md:block">
            <Breadcrumb.Link href="##"
              >Building Your Application</Breadcrumb.Link
            >
          </Breadcrumb.Item>
          <Breadcrumb.Separator class="hidden md:block" />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </header>
    <main class="flex-1 overflow-y-auto p-6">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
