// API endpoint for search_leads tool
// Searches LinkedIn via Apify (or returns mock data)

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { logger, createRequestContext } from './lib/logger.js'
import { jsonResponse, errorResponse } from './lib/helpers.js'
import { getAllLeads } from './lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ctx = createRequestContext(req as unknown as Request)
  ctx.path = '/api/search-leads'

  if (req.method !== 'POST') {
    return errorResponse(new Error('Method not allowed'), 405, ctx.request_id)
  }

  const { keywords, location, max_results = 20 } = req.body || {}

  logger.info(ctx, `Searching leads: ${keywords?.join(', ') || 'all'}`)

  try {
    const leads = await getAllLeads({ search: keywords?.[0], status: 'pending' })
    logger.info(ctx, `Found ${leads.length} leads`)
    return jsonResponse({ leads, count: leads.length })
  } catch (error) {
    logger.error(ctx, 'Lead search failed', error as Error)
    return errorResponse(error as Error, 500, ctx.request_id)
  }
}