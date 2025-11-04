<script lang="ts">
  import { invoke } from '@tauri-apps/api/core'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'

  let name = $state('')
  let greetMsg = $state('')

  async function greet(event: Event) {
    event.preventDefault()
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsg = await invoke('greet', { name })
  }
</script>

<main class="h-dvh m-0 pt-16 text-center flex flex-col gap-8 justify-center">
  <h1 class="text-4xl text-center mb-2">Yayyyy</h1>

  <div class="flex justify-center">
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="h-16 m-2" alt="Vite Logo" />
    </a>
    <a href="https://tauri.app" target="_blank">
      <img src="/tauri.svg" class="h-16 m-2" alt="Tauri Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank">
      <img src="/svelte.svg" class="h-16 m-2" alt="SvelteKit Logo" />
    </a>
  </div>

  <p class="text-pretty mx-8">
    Click on the Tauri, Vite, and SvelteKit logos to learn more.
  </p>

  <form class="flex justify-center gap-2 mx-8" onsubmit={greet}>
    <Input id="greet-input" placeholder="Enter a name..." bind:value={name} />
    <Button type="submit">Greet</Button>
  </form>
  <p>{greetMsg}</p>
</main>

<style>
</style>
