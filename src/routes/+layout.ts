import { configService } from '$lib/config/index'

export const load = async () => {
  // Initialize config service at app startup
  await configService.initialize()

  return {}
}

export const ssr = false
