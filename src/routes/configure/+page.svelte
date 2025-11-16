<script lang="ts">
  import Select from '$lib/components/custom/select.svelte'
  import * as Field from '$lib/components/ui/field'

  import { getDataSources } from '$lib/notion'
  import { PropertyMappingBuilder } from '$lib/abstraction/mapping.svelte'

  const propertyMappingBuilder = new PropertyMappingBuilder()
  const dataSourcesPromise = getDataSources()
</script>

<main class="flex flex-col min-h-screen py-8 px-4 max-w-xl mx-auto">
  <h1 class="text-4xl font-bold mb-8">Configure</h1>
  <form>
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
              bind:value={propertyMappingBuilder.dataSource}
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
      {#if propertyMappingBuilder.dataSource}
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
              items={propertyMappingBuilder.getPossiblePropertiesFor('title')}
              labelFn={(item) => item.name}
              placeholder="Select title property"
              bind:value={propertyMappingBuilder.titleProperty}
            />
          </Field.Field>
          <Field.Field>
            <Field.Label for="property-mapping-completed"
              >Completed Property</Field.Label
            >
            <Select
              id="property-mapping-completed"
              items={propertyMappingBuilder.getPossiblePropertiesFor(
                'completed'
              )}
              labelFn={(item) => item.name}
              placeholder="Select completed property"
              bind:value={propertyMappingBuilder.completedProperty}
            />
          </Field.Field>
          <Field.Field>
            <Field.Label for="property-mapping-due-date"
              >Due Date Property</Field.Label
            >
            <Select
              id="property-mapping-due-date"
              items={propertyMappingBuilder.getPossiblePropertiesFor('dueDate')}
              labelFn={(item) => item.name}
              placeholder="Select due date property"
              bind:value={propertyMappingBuilder.dueDateProperty}
            />
          </Field.Field>
          <Field.Field>
            <Field.Label for="property-mapping-priority"
              >Priority Property</Field.Label
            >
            <Select
              id="property-mapping-priority"
              items={propertyMappingBuilder.getPossiblePropertiesFor(
                'priority'
              )}
              labelFn={(item) => item.name}
              placeholder="Select priority property"
              bind:value={propertyMappingBuilder.priorityProperty}
            />
          </Field.Field>
          <Field.Field>
            <Field.Label for="property-mapping-do-date"
              >Do Date Property</Field.Label
            >
            <Select
              id="property-mapping-do-date"
              items={propertyMappingBuilder.getPossiblePropertiesFor('doDate')}
              labelFn={(item) => item.name}
              placeholder="Select do date property"
              bind:value={propertyMappingBuilder.doDateProperty}
            />
          </Field.Field>
        </Field.Group>
      {/if}
    </Field.Set>
  </form>
</main>
