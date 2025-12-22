/**
 * @file src/lib/stores/sync-state.svelte.ts
 * @description Global sync state management using Svelte 5 runes
 */

/**
 * Individual sync operation
 */
export interface SyncOperation {
  id: string
  type: 'fetch' | 'update' | 'create' | 'delete'
  resourceType: 'page' | 'database'
  resourceId?: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  error?: string
  createdAt: Date
  completedAt?: Date
}

/**
 * Global sync state
 */
export interface SyncState {
  /** Overall syncing status */
  isSyncing: boolean
  /** Last successful sync time */
  lastSyncedAt: Date | null
  /** Current operations in progress */
  pendingOperations: SyncOperation[]
  /** Recent errors */
  errors: Array<{ message: string; timestamp: Date }>
  /** Rate limiting info */
  rateLimit: {
    remaining: number
    resetAt: Date | null
  }
}

/**
 * Creates a reactive sync state store
 */
function createSyncStore() {
  // Reactive state using Svelte 5 runes
  let isSyncing = $state(false)
  let lastSyncedAt = $state<Date | null>(null)
  let pendingOperations = $state<SyncOperation[]>([])
  let errors = $state<Array<{ message: string; timestamp: Date }>>([])
  let rateLimitRemaining = $state(3) // Notion's 3 req/sec limit
  let rateLimitResetAt = $state<Date | null>(null)

  // Derived states
  const hasPendingOperations = $derived(pendingOperations.length > 0)
  const hasErrors = $derived(errors.length > 0)
  const canMakeRequest = $derived(rateLimitRemaining > 0)

  /**
   * Start a new sync operation
   */
  function startOperation(
    type: SyncOperation['type'],
    resourceType: SyncOperation['resourceType'],
    resourceId?: string
  ): string {
    const id = crypto.randomUUID()
    const operation: SyncOperation = {
      id,
      type,
      resourceType,
      resourceId,
      status: 'pending',
      createdAt: new Date(),
    }
    pendingOperations = [...pendingOperations, operation]
    isSyncing = true
    return id
  }

  /**
   * Mark an operation as in-progress
   */
  function markInProgress(operationId: string): void {
    pendingOperations = pendingOperations.map((op) =>
      op.id === operationId ? { ...op, status: 'in-progress' as const } : op
    )
  }

  /**
   * Complete an operation successfully
   */
  function completeOperation(operationId: string): void {
    pendingOperations = pendingOperations.map((op) =>
      op.id === operationId
        ? { ...op, status: 'completed' as const, completedAt: new Date() }
        : op
    )

    // Clean up completed operations after a short delay
    setTimeout(() => {
      pendingOperations = pendingOperations.filter(
        (op) => op.id !== operationId
      )
      updateSyncingState()
    }, 1000)

    lastSyncedAt = new Date()
  }

  /**
   * Mark an operation as failed
   */
  function failOperation(operationId: string, error: string): void {
    pendingOperations = pendingOperations.map((op) =>
      op.id === operationId
        ? { ...op, status: 'failed' as const, error, completedAt: new Date() }
        : op
    )
    errors = [...errors, { message: error, timestamp: new Date() }].slice(-10) // Keep last 10 errors

    // Clean up failed operations after a delay
    setTimeout(() => {
      pendingOperations = pendingOperations.filter(
        (op) => op.id !== operationId
      )
      updateSyncingState()
    }, 5000)
  }

  /**
   * Update rate limit info
   */
  function updateRateLimit(remaining: number, resetAt?: Date): void {
    rateLimitRemaining = remaining
    if (resetAt) {
      rateLimitResetAt = resetAt
    }
  }

  /**
   * Decrement rate limit counter
   */
  function decrementRateLimit(): void {
    rateLimitRemaining = Math.max(0, rateLimitRemaining - 1)

    // Reset after 1 second (Notion's rate limit window)
    if (!rateLimitResetAt) {
      rateLimitResetAt = new Date(Date.now() + 1000)
      setTimeout(() => {
        rateLimitRemaining = 3
        rateLimitResetAt = null
      }, 1000)
    }
  }

  /**
   * Clear all errors
   */
  function clearErrors(): void {
    errors = []
  }

  /**
   * Update the overall syncing state
   */
  function updateSyncingState(): void {
    isSyncing = pendingOperations.some(
      (op) => op.status === 'pending' || op.status === 'in-progress'
    )
  }

  return {
    // Reactive getters (using $derived would need to be in component context)
    get isSyncing() {
      return isSyncing
    },
    get lastSyncedAt() {
      return lastSyncedAt
    },
    get pendingOperations() {
      return pendingOperations
    },
    get errors() {
      return errors
    },
    get hasPendingOperations() {
      return hasPendingOperations
    },
    get hasErrors() {
      return hasErrors
    },
    get canMakeRequest() {
      return canMakeRequest
    },
    get rateLimitRemaining() {
      return rateLimitRemaining
    },
    get rateLimitResetAt() {
      return rateLimitResetAt
    },
    // Actions
    startOperation,
    markInProgress,
    completeOperation,
    failOperation,
    updateRateLimit,
    decrementRateLimit,
    clearErrors,
  }
}

// Export singleton instance
export const syncStore = createSyncStore()
