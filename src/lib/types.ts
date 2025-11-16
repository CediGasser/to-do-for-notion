export interface SimpleTask {
  id: string
  title: string
  completed: boolean
  category?: string
  dueDate?: Date
  priority?: string
  doDate?: Date
}
