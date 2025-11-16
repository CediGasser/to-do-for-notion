<script lang="ts" generics="T">
  import * as Select from '$lib/components/ui/select'

  interface Props {
    id: string
    items: T[]
    labelFn: (item: T) => string
    placeholder: string
    value: T | null
  }
  let {
    id,
    items,
    labelFn,
    placeholder = 'Select an option',
    value = $bindable(),
  }: Props = $props()

  let internalValue: string | undefined = $state()

  $effect(() => {
    if (value) {
      const selectedItem = items.find(
        (item) => labelFn(item) === (value as any).label
      )
      internalValue = selectedItem ? (selectedItem as any).value : undefined
    } else {
      internalValue = undefined
    }
  })

  const onValueChange = (newValue: string) => {
    const selectedItem = items.find((item) => labelFn(item) === newValue)
    value = selectedItem || null
  }
</script>

<Select.Root type="single" bind:value={internalValue} {onValueChange}>
  <Select.Trigger class="w-full" {id}>
    {#if value}
      {labelFn(value)}
    {:else}
      {placeholder}
    {/if}
  </Select.Trigger>
  <Select.Content>
    {#each items as item}
      <Select.Item value={labelFn(item)} label={labelFn(item)} />
    {/each}
  </Select.Content>
</Select.Root>
