<script lang="ts">
  import Select from '$lib/components/custom/select.svelte'
  import * as Field from '$lib/components/ui/field'

  import { getDataSources } from '$lib/notion'
  import {
    DataSourceMapping,
    registerMapping,
  } from '$lib/abstraction/mapping.svelte'
  import Input from '$lib/components/ui/input/input.svelte'
  import { goto } from '$app/navigation'

  const dataSourcesPromise = getDataSources()

  let propertyMapping = new DataSourceMapping()

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    registerMapping(propertyMapping.dataSource!.id, propertyMapping)
    goto('/default')
  }
</script>

<main class="flex flex-col min-h-screen py-8 px-4 max-w-xl mx-auto">
  <h1 class="text-4xl font-bold mb-8">Configure</h1>
  <form onsubmit={handleSubmit}>
    <Field.Set>
      <Field.Group>
        {#await dataSourcesPromise}
          <p>Loading data sources...</p>
        {:then dataSources}
          <Field.Field>
            <Field.Label for="data-source-select">
              Select a Notion Data Source
            </Field.Label>
            <Select
              id="data-source-select"
              items={dataSources}
              labelFn={(item) => item.title[0]?.plain_text || 'Untitled'}
              placeholder="Select a data source"
              bind:value={propertyMapping.dataSource}
            />
          </Field.Field>
        {:catch error}
          <p class="text-red-500">
            Error loading data sources: {error.message}
          </p>
        {/await}
      </Field.Group>
    </Field.Set>
    <Field.Separator class="my-4" />
    <Field.Set>
      {#if propertyMapping.dataSource}
        <Field.Legend>Property Mapping</Field.Legend>
        <Field.Description>
          Map the properties from your Notion data source to the task fields.
        </Field.Description>
        <Field.Group>
          <Field.Field>
            <Field.Label for="property-mapping-title"
              >Title Property</Field.Label
            >
            <Select
              id="property-mapping-title"
              items={propertyMapping.getPossiblePropertiesFor('title')}
              labelFn={(item) => item.name}
              placeholder="Select title property"
              bind:value={propertyMapping.titleProperty}
            />
          </Field.Field>
          <Field.Field>
            <Field.Label for="property-mapping-completed"
              >Completed Property</Field.Label
            >
            <Select
              id="property-mapping-completed"
              items={propertyMapping.getPossiblePropertiesFor('completed')}
              labelFn={(item) => item.name}
              placeholder="Select completed property"
              bind:value={propertyMapping.completedProperty}
            />
          </Field.Field>
          <Field.Field>
            <Field.Label for="property-mapping-due-date"
              >Due Date Property</Field.Label
            >
            <Select
              id="property-mapping-due-date"
              items={propertyMapping.getPossiblePropertiesFor('dueDate')}
              labelFn={(item) => item.name}
              placeholder="Select due date property"
              bind:value={propertyMapping.dueDateProperty}
            />
          </Field.Field>
          <Field.Field>
            <Field.Label for="property-mapping-category"
              >Category Property</Field.Label
            >
            <Field.Description>
              (Optional) You'll see tasks grouped by category in the app.
            </Field.Description>
            <Select
              id="property-mapping-category"
              items={propertyMapping.getPossiblePropertiesFor('category')}
              labelFn={(item) => item.name}
              placeholder="Select category property"
              bind:value={propertyMapping.categoryProperty}
            />
          </Field.Field>
          <Field.Field>
            <Field.Label for="property-mapping-priority"
              >Priority Property</Field.Label
            >
            <Select
              id="property-mapping-priority"
              items={propertyMapping.getPossiblePropertiesFor('priority')}
              labelFn={(item) => item.name}
              placeholder="Select priority property"
              bind:value={propertyMapping.priorityProperty}
            />
          </Field.Field>
          <Field.Field>
            <Field.Label for="property-mapping-do-date"
              >Do Date Property</Field.Label
            >
            <Select
              id="property-mapping-do-date"
              items={propertyMapping.getPossiblePropertiesFor('doDate')}
              labelFn={(item) => item.name}
              placeholder="Select do date property"
              bind:value={propertyMapping.doDateProperty}
            />
          </Field.Field>
        </Field.Group>
      {/if}
    </Field.Set>
    <Input
      type="submit"
      value="Save Configuration"
      class="mt-6"
      disabled={!propertyMapping.isValidMapping}
    />
  </form>
</main>
