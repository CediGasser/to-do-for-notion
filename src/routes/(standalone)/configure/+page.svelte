<script lang="ts">
  import Select from '$lib/components/custom/select.svelte'
  import * as Field from '$lib/components/ui/field'
  import { FieldMappingBuilder } from '$lib/abstraction/field-mapping-builder.svelte'
  import {
    DataSourceConfigManager,
    type DataSourceConfig,
  } from '$lib/config/index'
  import {
    DEFAULT_SYSTEM_LISTS,
    type TaskListDefinition,
  } from '$lib/config/types'
  import Input from '$lib/components/ui/input/input.svelte'
  import { goto } from '$app/navigation'

  let { data } = $props()

  let builder = new FieldMappingBuilder()
  let isSaving = $state(false)
  let errorMessage = $state<string | null>(null)

  // Get suggested task lists based on category selection
  let suggestedTaskLists = $derived(builder.getSuggestedTaskLists())

  // Track which custom lists are selected (all by default)
  let selectedCustomLists = $state<Set<string>>(new Set())

  // When category changes, auto-select all suggested custom lists
  $effect(() => {
    if (builder.categoryProperty) {
      const customLists = suggestedTaskLists.filter((l) => l.type === 'custom')
      selectedCustomLists = new Set(customLists.map((l) => l.id))
    }
  })

  function toggleCustomList(listId: string) {
    const newSet = new Set(selectedCustomLists)
    if (newSet.has(listId)) {
      newSet.delete(listId)
    } else {
      newSet.add(listId)
    }
    selectedCustomLists = newSet
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    errorMessage = null

    const dataSourceId = builder.dataSource?.id
    const dataSourceName =
      builder.dataSource?.title[0]?.plain_text || 'Untitled'

    if (!dataSourceId) {
      errorMessage = 'No data source selected'
      return
    }

    if (!builder.isValidMapping) {
      errorMessage = 'Please complete all required fields'
      return
    }

    isSaving = true

    try {
      // Build the field mappings
      const fieldMappings = builder.build()

      // Build the task lists (system + selected custom)
      const taskLists: TaskListDefinition[] = [
        ...DEFAULT_SYSTEM_LISTS,
        ...suggestedTaskLists.filter(
          (l) => l.type === 'custom' && selectedCustomLists.has(l.id)
        ),
      ]

      // Create the data source config
      const dsConfig: DataSourceConfig = {
        id: dataSourceId,
        name: dataSourceName,
        fieldMappings,
        taskLists,
        lastSyncedAt: new Date().toISOString(),
      }

      // Save to config manager
      const configManager = await DataSourceConfigManager.getInstance()
      configManager.setDataSource(dsConfig)
      configManager.defaultDataSourceId = dataSourceId
      await configManager.save()

      // Navigate to the task list
      goto(`/${dataSourceId}/all`)
    } catch (error) {
      console.error('Failed to save configuration:', error)
      errorMessage =
        error instanceof Error ? error.message : 'Failed to save configuration'
    } finally {
      isSaving = false
    }
  }
</script>

<main class="flex flex-col min-h-screen py-8 px-4 max-w-xl mx-auto">
  <h1 class="text-4xl font-bold mb-8">Configure</h1>

  {#if errorMessage}
    <div
      class="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4 border border-destructive/20"
    >
      {errorMessage}
    </div>
  {/if}

  <form onsubmit={handleSubmit}>
    <Field.Set>
      <Field.Group>
        <Field.Field>
          <Field.Label for="data-source-select">
            Select a Notion Database
          </Field.Label>
          <Field.Description>
            Choose the Notion database that contains your tasks.
          </Field.Description>
          <Select
            id="data-source-select"
            items={data.dataSources}
            labelFn={(item) => item.title[0]?.plain_text || 'Untitled'}
            placeholder="Select a database"
            bind:value={builder.dataSource}
          />
        </Field.Field>
      </Field.Group>
    </Field.Set>

    {#if builder.dataSource}
      <Field.Separator class="my-6" />

      <Field.Set>
        <Field.Legend>Required Fields</Field.Legend>
        <Field.Description>
          Map these required properties from your Notion database.
        </Field.Description>
        <Field.Group>
          <Field.Field>
            <Field.Label for="property-mapping-title"
              >Title Property</Field.Label
            >
            <Select
              id="property-mapping-title"
              items={builder.getPossiblePropertiesFor('title')}
              labelFn={(item) => item.name}
              placeholder="Select title property"
              bind:value={builder.titleProperty}
            />
          </Field.Field>

          <Field.Set>
            <Field.Field>
              <Field.Label for="property-mapping-completed">
                Completed Property
              </Field.Label>
              <Field.Description>
                Can be a checkbox or a status field.
              </Field.Description>
              <Select
                id="property-mapping-completed"
                items={builder.getPossibleCompletedProperties()}
                labelFn={(item) => `${item.name} (${item.type})`}
                placeholder="Select completed property"
                bind:value={builder.completedProperty}
              />
            </Field.Field>

            {#if builder.completedNeedsEnumMapping}
              <div class="pl-4 border-l-2 border-muted space-y-4">
                <Field.Field>
                  <Field.Label for="property-mapping-completed-false-id">
                    "Not Done" Status
                  </Field.Label>
                  <Field.Description>
                    Select the status that represents an incomplete task.
                  </Field.Description>
                  <Select
                    id="property-mapping-completed-false-id"
                    items={builder.getEnumOptionsFor(builder.completedProperty)}
                    labelFn={(item) => item.name}
                    placeholder="Select incomplete status"
                    bind:value={builder.completedFalseOption}
                  />
                </Field.Field>
                <Field.Field>
                  <Field.Label for="property-mapping-completed-true-id">
                    "Done" Status
                  </Field.Label>
                  <Field.Description>
                    Select the status that represents a completed task.
                  </Field.Description>
                  <Select
                    id="property-mapping-completed-true-id"
                    items={builder.getEnumOptionsFor(builder.completedProperty)}
                    labelFn={(item) => item.name}
                    placeholder="Select completed status"
                    bind:value={builder.completedTrueOption}
                  />
                </Field.Field>
              </div>
            {/if}
          </Field.Set>
        </Field.Group>
      </Field.Set>

      <Field.Separator class="my-6" />

      <Field.Set>
        <Field.Legend>Optional Fields</Field.Legend>
        <Field.Description>
          Map additional properties to enhance your task experience.
        </Field.Description>
        <Field.Group>
          <Field.Field>
            <Field.Label for="property-mapping-category">
              Category Property
            </Field.Label>
            <Field.Description>
              Used to create custom task lists based on categories.
            </Field.Description>
            <Select
              id="property-mapping-category"
              items={builder.getPossiblePropertiesFor('category')}
              labelFn={(item) => item.name}
              placeholder="Select category property (optional)"
              bind:value={builder.categoryProperty}
            />
          </Field.Field>

          <Field.Field>
            <Field.Label for="property-mapping-due-date">
              Due Date Property
            </Field.Label>
            <Select
              id="property-mapping-due-date"
              items={builder.getPossiblePropertiesFor('dueDate')}
              labelFn={(item) => item.name}
              placeholder="Select due date property (optional)"
              bind:value={builder.dueDateProperty}
            />
          </Field.Field>

          <Field.Field>
            <Field.Label for="property-mapping-do-date">
              "My Day" Date Property
            </Field.Label>
            <Field.Description>
              A date field to mark tasks for your daily view.
            </Field.Description>
            <Select
              id="property-mapping-do-date"
              items={builder.getPossiblePropertiesFor('doDate')}
              labelFn={(item) => item.name}
              placeholder="Select do date property (optional)"
              bind:value={builder.doDateProperty}
            />
          </Field.Field>

          <Field.Field>
            <Field.Label for="property-mapping-priority">
              Priority Property
            </Field.Label>
            <Select
              id="property-mapping-priority"
              items={builder.getPossiblePropertiesFor('priority')}
              labelFn={(item) => item.name}
              placeholder="Select priority property (optional)"
              bind:value={builder.priorityProperty}
            />
          </Field.Field>
        </Field.Group>
      </Field.Set>

      {#if builder.categoryProperty && suggestedTaskLists.filter((l) => l.type === 'custom').length > 0}
        <Field.Separator class="my-6" />

        <Field.Set>
          <Field.Legend>Task Lists</Field.Legend>
          <Field.Description>
            Based on your category field, we suggest creating these lists.
            Uncheck any you don't want.
          </Field.Description>
          <div class="space-y-2 mt-4">
            {#each suggestedTaskLists.filter((l) => l.type === 'custom') as list (list.id)}
              <label
                class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors {selectedCustomLists.has(
                  list.id
                )
                  ? 'bg-muted/30'
                  : ''}"
              >
                <input
                  type="checkbox"
                  checked={selectedCustomLists.has(list.id)}
                  onchange={() => toggleCustomList(list.id)}
                  class="w-4 h-4"
                />
                <span class="text-lg">{list.icon}</span>
                <span class="font-medium">{list.name}</span>
              </label>
            {/each}
          </div>
        </Field.Set>
      {/if}
    {/if}

    <div class="mt-8">
      <Input
        type="submit"
        value={isSaving ? 'Saving...' : 'Save Configuration'}
        class="w-full"
        disabled={!builder.isValidMapping || isSaving}
      />
    </div>
  </form>
</main>
