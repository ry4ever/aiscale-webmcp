// API endpoint for get_campaign_analytics tool
// Returns real-time campaign performance metrics

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { logger, createRequestContext } from './lib/logger.js'
import { jsonResponse, errorResponse } from './lib/helpers.js'
import { getDashboardStats, getCampaignAnalytics } from './lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ctx = createRequestContext(req as unknown as Request)
  ctx.path = '/api/analytics'

  logger.info(ctx, 'Fetching analytics')

  try {
    const summary = await getDashboardStats()
    const analytics = await getCampaignAnalytics()

    logger.info(ctx, `Analytics returned for ${summary.total_campaigns} campaigns`)

    return jsonResponse({
      campaigns: [],
      summary,
      ...analytics,
    })
  } catch (error) {
    logger.error(ctx, 'Analytics fetch failed', error as Error)
    return errorResponse(error as Error, 500, ctx.request_id)
  }
}