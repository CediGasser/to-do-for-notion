<script lang="ts">
  import { page } from '$app/state'
  import '../app.css'
  let { children } = $props()

  $inspect(page.url.pathname)
</script>

{@render children?.()}
