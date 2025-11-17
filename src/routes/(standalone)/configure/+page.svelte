<script lang="ts">
  import Select from '$lib/components/custom/select.svelte'
  import * as Field from '$lib/components/ui/field'
  import { DataSourceMappingBuilder } from '$lib/abstraction/mapping.svelte'
  import config from '$lib/config'
  import Input from '$lib/components/ui/input/input.svelte'
  import { goto } from '$app/navigation'

  let { data } = $props()

  let propertyMappingBuilder = new DataSourceMappingBuilder()

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    // build the mapping
    const mapping = propertyMappingBuilder.buildMapping()
    const dataSourceId = propertyMappingBuilder.dataSource?.id

    if (!dataSourceId) {
      console.error('No data source selected')
      return
    }

    // save the mapping to config
    config.dataSourceMappings[dataSourceId] = mapping
    config.defaultDataSourceId = dataSourceId
    config.save()

    goto(`/${dataSourceId}/default`)
  }
</script>

<main class="flex flex-col min-h-screen py-8 px-4 max-w-xl mx-auto">
  <h1 class="text-4xl font-bold mb-8">Configure</h1>
  <form onsubmit={handleSubmit}>
    <Field.Set>
      <Field.Group>
        <Field.Field>
          <Field.Label for="data-source-select">
            Select a Notion Data Source
          </Field.Label>
          <Select
            id="data-source-select"
            items={data.dataSources}
            labelFn={(item) => item.title[0]?.plain_text || 'Untitled'}
            placeholder="Select a data source"
            bind:value={propertyMappingBuilder.dataSource}
          />
        </Field.Field>
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
          <Field.Set>
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
            {#if propertyMappingBuilder.completedProperty?.type === 'status'}
              <Field.Field>
                <Field.Description>
                  Select the status that represents an incomplete task.
                </Field.Description>
                <Select
                  id="property-mapping-completed-false-id"
                  items={propertyMappingBuilder.getPossibleEnumsFor(
                    propertyMappingBuilder.completedProperty
                  )}
                  labelFn={(item) => item.name}
                  placeholder="Select completed checkbox false value"
                  bind:value={propertyMappingBuilder.completedEnumFalseOption}
                />
              </Field.Field>
              <Field.Field>
                <Field.Description>
                  Select the status that represents a completed task.
                </Field.Description>
                <Select
                  id="property-mapping-completed-true-id"
                  items={propertyMappingBuilder.getPossibleEnumsFor(
                    propertyMappingBuilder.completedProperty
                  )}
                  labelFn={(item) => item.name}
                  placeholder="Select completed checkbox true value"
                  bind:value={propertyMappingBuilder.completedEnumTrueOption}
                />
              </Field.Field>
            {/if}
          </Field.Set>
          <Field.Separator class="my-4" />
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
            <Field.Label for="property-mapping-category"
              >Category Property</Field.Label
            >
            <Field.Description>
              (Optional) You'll see tasks grouped by category in the app.
            </Field.Description>
            <Select
              id="property-mapping-category"
              items={propertyMappingBuilder.getPossiblePropertiesFor(
                'category'
              )}
              labelFn={(item) => item.name}
              placeholder="Select category property"
              bind:value={propertyMappingBuilder.categoryProperty}
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
    <Input
      type="submit"
      value="Save Configuration"
      class="mt-6"
      disabled={!propertyMappingBuilder.isValidMapping}
    />
  </form>
</main>
