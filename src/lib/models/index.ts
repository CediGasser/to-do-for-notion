/**
 * @file src/lib/models/index.ts
 * @description Model exports
 */

export {
  type BasePropertyMapping,
  type DirectPropertyMapping,
  type EnumToBooleanMapping,
  type CheckboxPropertyMapping,
  type PropertyMappingType,
  type FieldMappings,
  isEnumToBooleanMapping,
  isCheckboxMapping,
  isDirectMapping,
  createDirectMapping,
  createEnumToBooleanMapping,
  createCheckboxMapping,
} from './field-mapping'

export {
  type MappedFieldValue,
  type Task,
  pageToTask,
  getTaskTitle,
  isTaskCompleted,
} from './task'

export {
  type TaskList,
  filterTasksForList,
  createCategoryTaskList,
} from './task-list'
