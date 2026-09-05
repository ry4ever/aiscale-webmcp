// API endpoint for campaign management

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { logger, createRequestContext } from './lib/logger.js'
import { jsonResponse, errorResponse } from './lib/helpers.js'
import { createCampaign, getAllCampaigns, getCampaign, updateCampaign } from './lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ctx = createRequestContext(req as unknown as Request)
  ctx.path = '/api/campaign'

  const action = req.query.action as string

  logger.info(ctx, `Campaign ${action || 'query'} requested`)

  try {
    await import('./lib/db.js').then(db => db.init().catch(() => {}))

    if (req.method === 'POST') {
      const campaign = await createCampaign({
        id: `campaign_${Date.now()}`,
        name: req.body?.name || 'New Campaign',
        status: 'running',
        ...req.body,
      })
      logger.info(ctx, `Campaign created: ${campaign.id}`)
      return jsonResponse(campaign)
    }

    if (req.method === 'GET') {
      const campaigns = await getAllCampaigns()
      return jsonResponse(campaigns)
    }

    return errorResponse(new Error('Method not allowed'), 405, ctx.request_id)
  } catch (error) {
    logger.error(ctx, 'Campaign operation failed', error as Error)
    return errorResponse(error as Error, 500, ctx.request_id)
  }
}