/**
 * @file src/lib/services/notion/client.ts
 * @description Rate-limited Notion client
 *
 * Wraps the Notion SDK with rate limiting (3 req/sec for Notion API)
 * and integrates with the sync state store.
 */

import { PUBLIC_NOTION_INTEGRATION_SECRET } from '$env/static/public'
import { Client, isFullDataSource, isFullPage } from '@notionhq/client'
import type {
  DataSourceObjectResponse,
  PageObjectResponse,
  UpdatePageParameters,
} from '@notionhq/client'
import { fetch } from '@tauri-apps/plugin-http'
import { syncStore } from '$lib/stores/sync-state.svelte'

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 3
const RATE_LIMIT_WINDOW_MS = 1000

/**
 * Request queue for rate limiting
 */
interface QueuedRequest<T> {
  execute: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
  operationId: string
}

class RateLimitedNotionClient {
  private client: Client
  private requestQueue: QueuedRequest<unknown>[] = []
  private requestsInWindow: number = 0
  private windowStartTime: number = Date.now()
  private isProcessingQueue: boolean = false

  constructor() {
    this.client = new Client({
      auth: PUBLIC_NOTION_INTEGRATION_SECRET,
      // Using Tauri's HTTP plugin for CORS-free requests
      fetch: fetch,
    })
  }

  /**
   * Get the underlying Notion client for direct access
   */
  getClient(): Client {
    return this.client
  }

  /**
   * Queue a request with rate limiting
   */
  private queueRequest<T>(
    execute: () => Promise<T>,
    operationType: 'fetch' | 'update' | 'create' | 'delete',
    resourceType: 'page' | 'database',
    resourceId?: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const operationId = syncStore.startOperation(
        operationType,
        resourceType,
        resourceId
      )

      this.requestQueue.push({
        execute,
        resolve: resolve as (value: unknown) => void,
        reject,
        operationId,
      })

      this.processQueue()
    })
  }

  /**
   * Process the request queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return
    this.isProcessingQueue = true

    while (this.requestQueue.length > 0) {
      // Check rate limit
      const now = Date.now()
      if (now - this.windowStartTime >= RATE_LIMIT_WINDOW_MS) {
        // Reset window
        this.windowStartTime = now
        this.requestsInWindow = 0
      }

      if (this.requestsInWindow >= RATE_LIMIT_REQUESTS) {
        // Wait for next window
        const waitTime = RATE_LIMIT_WINDOW_MS - (now - this.windowStartTime)
        await new Promise((r) => setTimeout(r, waitTime))
        continue
      }

      // Process next request
      const request = this.requestQueue.shift()
      if (!request) break

      this.requestsInWindow++
      syncStore.markInProgress(request.operationId)
      syncStore.decrementRateLimit()

      try {
        const result = await request.execute()
        syncStore.completeOperation(request.operationId)
        request.resolve(result)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        syncStore.failOperation(request.operationId, errorMessage)
        request.reject(error instanceof Error ? error : new Error(errorMessage))
      }
    }

    this.isProcessingQueue = false
  }

  /**
   * Fetch all data sources (databases) accessible to the integration
   */
  async getDataSources(): Promise<DataSourceObjectResponse[]> {
    return this.queueRequest(
      async () => {
        const response = await this.client.search({
          filter: {
            property: 'object',
            value: 'data_source',
          },
        })

        return response.results
          .filter(isFullDataSource)
          .filter((ds) => !ds.archived && !ds.in_trash)
      },
      'fetch',
      'database'
    )
  }

  /**
   * Get a specific data source by ID
   */
  async getDataSource(dataSourceId: string): Promise<DataSourceObjectResponse> {
    return this.queueRequest(
      async () => {
        const dataSource = await this.client.dataSources.retrieve({
          data_source_id: dataSourceId,
        })

        if (!isFullDataSource(dataSource)) {
          throw new Error('Data source is not a full data source')
        }

        return dataSource
      },
      'fetch',
      'database',
      dataSourceId
    )
  }

  /**
   * Query pages from a data source
   */
  async queryDataSource(
    dataSourceId: string,
    options?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter?: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sorts?: any[]
      pageSize?: number
      startCursor?: string
    }
  ): Promise<{
    results: PageObjectResponse[]
    hasMore: boolean
    nextCursor: string | null
  }> {
    return this.queueRequest(
      async () => {
        const response = await this.client.dataSources.query({
          data_source_id: dataSourceId,
          filter: options?.filter,
          sorts: options?.sorts,
          page_size: options?.pageSize ?? 100,
          start_cursor: options?.startCursor,
        })

        return {
          results: response.results
            .filter(isFullPage)
            .filter(
              (page): page is PageObjectResponse =>
                !page.archived && !page.in_trash
            ),
          hasMore: response.has_more,
          nextCursor: response.next_cursor,
        }
      },
      'fetch',
      'database',
      dataSourceId
    )
  }

  /**
   * Get all pages from a data source (handles pagination)
   */
  async getAllPagesFromDataSource(
    dataSourceId: string
  ): Promise<PageObjectResponse[]> {
    const allPages: PageObjectResponse[] = []
    let hasMore = true
    let cursor: string | undefined = undefined

    while (hasMore) {
      const {
        results,
        hasMore: more,
        nextCursor,
      } = await this.queryDataSource(dataSourceId, { startCursor: cursor })
      allPages.push(...results)
      hasMore = more
      cursor = nextCursor ?? undefined
    }

    return allPages
  }

  /**
   * Get a specific page by ID
   */
  async getPage(pageId: string): Promise<PageObjectResponse> {
    return this.queueRequest(
      async () => {
        const page = await this.client.pages.retrieve({ page_id: pageId })

        if (!isFullPage(page)) {
          throw new Error('Page is not a full page')
        }

        return page
      },
      'fetch',
      'page',
      pageId
    )
  }

  /**
   * Update a page's properties
   */
  async updatePage(
    pageId: string,
    properties: UpdatePageParameters['properties']
  ): Promise<PageObjectResponse> {
    return this.queueRequest(
      async () => {
        const result = await this.client.pages.update({
          page_id: pageId,
          properties,
        })

        if (!isFullPage(result)) {
          throw new Error('Updated page is not a full page')
        }

        return result
      },
      'update',
      'page',
      pageId
    )
  }

  /**
   * Create a new page in a data source
   */
  async createPage(
    dataSourceId: string,
    properties: UpdatePageParameters['properties']
  ): Promise<PageObjectResponse> {
    return this.queueRequest(
      async () => {
        const result = await this.client.pages.create({
          parent: { database_id: dataSourceId },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          properties: properties as any,
        })

        if (!isFullPage(result)) {
          throw new Error('Created page is not a full page')
        }

        return result
      },
      'create',
      'page'
    )
  }

  /**
   * Archive (delete) a page
   */
  async archivePage(pageId: string): Promise<void> {
    return this.queueRequest(
      async () => {
        await this.client.pages.update({
          page_id: pageId,
          archived: true,
        })
      },
      'delete',
      'page',
      pageId
    )
  }
}

// Export singleton instance
export const notionClient = new RateLimitedNotionClient()
