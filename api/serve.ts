// Main API entry point for Vercel
// Combines all route handlers with middleware

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Import all route handlers
import searchLeadsHandler from './search-leads'
import enrichLeadHandler from './enrich-lead'
import scoreLeadHandler from './score-lead'
import generateEmailHandler from './generate-email'
import followUpSequenceHandler from './follow-up-sequence'
import campaignHandler from './campaign'
import analyticsHandler from './analytics'
import sendEmailHandler from './send-email'
import webhookResendHandler from './webhooks/resend'
import _middleware from './_middleware'

// Route mapping
const routes: Record<string, any> = {
  'search-leads': searchLeadsHandler,
  'enrich-lead': enrichLeadHandler,
  'score-lead': scoreLeadHandler,
  'generate-email': generateEmailHandler,
  'follow-up-sequence': followUpSequenceHandler,
  'campaign': campaignHandler,
  'analytics': analyticsHandler,
  'send-email': sendEmailHandler,
  'webhooks/resend': webhookResendHandler,
}

// Error response helper
function defineResponseHeaders(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
}

export async function GET(req: NextRequest, context: { params: Record<string, string> }) {
  const path = context.params.path || ''
  const handler = routes[path]

  if (!handler) {
    return new NextResponse(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return handler(req, { params: context.params }, () => {})
}

export async function POST(req: NextRequest, context: { params: Record<string, string> }) {
  const path = context.params.path || ''
  const handler = routes[path]

  if (!handler) {
    return new NextResponse(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return handler(req, { params: context.params }, () => {})
}

export async function PUT(req: NextRequest, context: { params: Record<string, string> }) {
  const path = context.params.path || ''
  const handler = routes[path]

  if (!handler) {
    return new NextResponse(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return handler(req, { params: context.params }, () => {})
}

export async function DELETE(req: NextRequest, context: { params: Record<string, string> }) {
  const path = context.params.path || ''
  const handler = routes[path]

  if (!handler) {
    return new NextResponse(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return handler(req, { params: context.params }, () => {})
}

export async function OPTIONS(req: NextRequest, context: { params: Record<string, string> }) {
  const response = new NextResponse(null, { status: 204 })
  defineResponseHeaders(response)
  return response
}

export async function PATCH(req: NextRequest, context: { params: Record<string, string> }) {
  const path = context.params.path || ''
  const handler = routes[path]

  if (!handler) {
    return new NextResponse(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return handler(req, { params: context.params }, () => {})
}

// Catch-all route
export async function handler(req: NextRequest, context: { params: Record<string, string> }) {
  return GET(req, context) // Fallback to GET for any undefined routes
}