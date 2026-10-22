import { useEffect, useState } from 'react'
import { BarChart3, Users, Send, Zap, Activity, Shield } from 'lucide-react'

type ToolCallResult = {
  success: boolean
  data?: any
  error?: string
  tool_name: string
  duration_ms?: number
}

export function Dashboard() {
  const [searchResults, setSearchResults] = useState<any>(null)
  const [dossiers, setDossiers] = useState<{ leadId: string, dossier: any }[]>([])
  const [scores, setScores] = useState<{ leadId: string, score: number }[]>([])
  const [emails, setEmails] = useState<{ leadId: string, email: any }[]>([])
  const [campaign, setCampaign] = useState<{ searchCriteria: any, context: any, keywords?: string[], campaign_id?: string } | null>(null)
  const [campaignResult, setCampaignResult] = useState<any>(null)
  const [activityLog, setActivityLog] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastRunTime, setLastRunTime] = useState<string>('Never')
  const [toolCallHistory, setToolCallHistory] = useState<ToolCallResult[]>([])

  const logActivity = (msg: string) => {
    setActivityLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`].slice(-20))
  }

  const handleSearchLeads = async (criteria: any) => {
    setIsLoading(true)
    setActivityLog([])

    try {
      const result = await (window as any).webmcpTools.searchLeads({
        keywords: criteria.keywords,
        location: criteria.location,
        job_title: criteria.job_title,
        company_size: criteria.company_size,
        industry: criteria.industry,
        max_results: criteria.max_results
      })

      setSearchResults(result)
      setLastRunTime(new Date().toLocaleTimeString())
      logActivity(`search_leads returned ${result.leads.length} leads`)
      setToolCallHistory(prev => [...prev, { success: true, tool_name: 'search_leads', duration_ms: 800 }])

    } catch (err: any) {
      logActivity(`search_leads failed: ${err.message}`)
      setToolCallHistory(prev => [...prev, { success: false, tool_name: 'search_leads', error: err.message }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnrichLead = async (leadId: string) => {
    setIsLoading(true)

    try {
      const result = await (window as any).webmcpTools.enrichLead({
        lead_id: leadId
      })

      const alreadyExists = dossiers.some(d => d.leadId === leadId)
      if (!alreadyExists) {
        setDossiers(prev => [...prev, { leadId, dossier: result.dossier }])
      }
      logActivity(`enrich_lead completed for ${leadId} in ${result.enrichment_time_ms}ms`)
      setToolCallHistory(prev => [...prev, { success: true, tool_name: 'enrich_lead', duration_ms: result.enrichment_time_ms }])
    } catch (err: any) {
      logActivity(`enrich_lead failed: ${err.message}`)
      setToolCallHistory(prev => [...prev, { success: false, tool_name: 'enrich_lead', error: err.message }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleScoreLead = async (leadId: string, dossier: any) => {
    setIsLoading(true)

    try {
      const result = await (window as any).webmcpTools.scoreLead({
        lead_id: leadId,
        dossier: dossier
      })

      setScores(prev => {
        const idx = prev.findIndex(s => s.leadId === leadId)
        if (idx >= 0) return [...prev.slice(0, idx), { leadId, score: result.score }]
        return [...prev, { leadId, score: result.score }]
      })
      logActivity(`score_lead: ${result.tier} tier (${result.score})`)
      setToolCallHistory(prev => [...prev, { success: true, tool_name: 'score_lead', duration_ms: 600 }])
    } catch (err: any) {
      logActivity(`score_lead failed: ${err.message}`)
      setToolCallHistory(prev => [...prev, { success: false, tool_name: 'score_lead', error: err.message }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateEmail = async (leadId: string, dossier: any, context: any) => {
    setIsLoading(true)

    try {
      const result = await (window as any).webmcpTools.generateEmail({
        lead_id: leadId,
        dossier: dossier,
        campaign_context: context
      })

      setEmails(prev => [...prev, { leadId, email: { subject: result.subject, body: result.body } }])
      logActivity(`email generated for ${leadId}: ${result.subject}`)
      setToolCallHistory(prev => [...prev, { success: true, tool_name: 'generate_email', duration_ms: 500 }])
    } catch (err: any) {
      logActivity(`generate_email failed: ${err.message}`)
      setToolCallHistory(prev => [...prev, { success: false, tool_name: 'generate_email', error: err.message }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmail = async (toEmail: string, toName: string, subject: string, body: string) => {
    setIsLoading(true)

    try {
      const result = await (window as any).webmcpTools.sendEmail({
        to_email: toEmail,
        to_name: toName,
        subject,
        body
      })

      logActivity(`✅ Email sent to ${toName} (${result.email_id})`)
      setToolCallHistory(prev => [...prev, { success: true, tool_name: 'send_email', duration_ms: 300 }])
    } catch (err: any) {
      logActivity(`send_email failed: ${err.message}`)
      setToolCallHistory(prev => [...prev, { success: false, tool_name: 'send_email', error: err.message }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartCampaign = async (criteria: any) => {
    setIsLoading(true)
    setCampaign(criteria)
    setCampaignResult(null)

    try {
      const result = await (window as any).webmcpTools.run_full_campaign({
        search_criteria: criteria,
        campaign_context: {
          value_proposition: "Help companies scale their AI infrastructure and reduce compute costs while increasing engineering productivity",
          cta: "Would you be interested in seeing how we could help your team?",
          product_description: "AI SDR platform that automates outbound lead gen, enrichment, and personalized email campaigns",
          sender_name: "Alex Chen",
          sender_company: "AIScale.pro"
        },
        max_leads: 20,
        auto_send: false
      })

      setCampaign(prev => prev && { ...prev, campaign_id: result.campaign_id })
      setCampaignResult(result.results)
      setToolCallHistory(prev => [...prev, { success: result.status === 'completed', tool_name: 'run_full_campaign', duration_ms: result.results?.duration_ms, error: result.results?.error }])
    } catch (err: any) {
      logActivity(`run_full_campaign failed: ${err.message}`)
      setToolCallHistory(prev => [...prev, { success: false, tool_name: 'run_full_campaign', error: err.message }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Start-here cue for first-time visitors */}
      {!searchResults && campaign === null && toolCallHistory.length === 0 && (
        <div className="flex items-start gap-3 p-4 mb-4 rounded-lg border border-primary/20 bg-primary/5 text-sm">
          <span className="text-lg leading-none">👉</span>
          <p className="text-gray-700">
            <strong>Start here:</strong> click <strong>Search 20 Leads</strong> to have the agent pull a lead list, then hit <strong>Enrich</strong> on any lead to see the next tool in the pipeline.
          </p>
        </div>
      )}

      {/* Quick Actions Header */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => handleSearchLeads({
            keywords: ['SaaS', 'Founder'],
            location: 'United States',
            job_title: 'CEO',
            company_size: '11-50',
            industry: 'SaaS',
            max_results: 20
          })} className="flex-1 py-3 rounded-lg bg-primary text-white text-sm font-medium transition-colors hover:bg-primary/90">
          🔍 Search 20 Leads
        </button>
        <button
          onClick={() => handleStartCampaign({
            keywords: ['SaaS', 'Founder'],
            industry: 'SaaS',
            max_results: 20
          })} className="flex-1 py-3 rounded-lg border border-primary bg-card text-primary text-sm font-medium transition-colors hover:bg-primary/5">
          🚀 Run Campaign
        </button>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="border rounded-lg p-4 mb-6 bg-card">
          <h3 className="font-semibold mb-3">Search Results ({(searchResults as any).leads?.length || 0} leads)</h3>
          <div className="space-y-2 text-sm">
            {searchResults.leads.map((lead: any) => (
              <div key={lead.id} className="p-3 rounded border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.headline}</p>
                    <p className="text-xs text-gray-500">{lead.company} | {lead.location}</p>
                  </div>
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium ${lead.initial_score >= 70 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}
                  `}>Score: {lead.initial_score}</span>
                </div>
                <button
                  onClick={() => handleEnrichLead(lead.id)}
                  className="mt-2 w-full py-2 rounded bg-secondary/10 text-secondary text-sm hover:bg-secondary/20 transition-colors"
                >
                  📊 Enrich
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {campaign !== null && campaign !== undefined && (
        <div className={`border rounded-lg p-6 mb-6 bg-card ${campaignResult ? '' : 'animate-pulse'}`}>
          <h3 className="font-semibold mb-3">Campaign: {(campaign.keywords || ['Processing']).join(', ')}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {campaignResult ? 'AI SDR workflow complete (drafts only, nothing sent).' : 'Processing AI SDR workflow...'}
          </p>
          {campaignResult && !campaignResult.error ? (
            <div className="grid grid-cols-4 gap-4">
              {[
                ['Discovered', campaignResult.discovered],
                ['Enriched', campaignResult.enriched],
                ['Scored', campaignResult.scored],
                ['Emails drafted', campaignResult.emails_generated],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-primary">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className={`text-2xl font-bold ${campaignResult?.error ? 'text-error' : 'text-primary'}`}>
                {campaignResult?.error ? 'Failed' : 'Processing...'}
              </div>
              <div className="text-xs text-gray-500">Campaign ID: {(campaign.campaign_id || 'run_pending')}</div>
            </div>
          )}
        </div>
      )}

      {/* Tool Call History */}
      {toolCallHistory.length > 0 && (
        <div className="border rounded-lg p-4 mb-6 bg-card">
          <h3 className="font-semibold mb-3">Recent Tool Calls</h3>
          <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
            {toolCallHistory.map((call, i) => (
              <div key={i} className={`p-2 rounded ${call.success ? 'bg-primary/10' : 'bg-error/10'} ${call.success ? 'text-primary' : 'text-error'}`}>
                <span className="font-medium">{call.tool_name}</span>
                <span className="ml-2">
                  {call.success
                    ? `✅ ${call.duration_ms ?? '?'}ms`
                    : `❌ ${call.error?.substring(0, 40)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {searchResults && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded bg-card border border-border">
            <div className="text-3xl font-bold text-primary">{dossiers.length}</div>
            <div className="text-xs text-gray-500">Enriched Leads</div>
          </div>
          <div className="p-4 rounded bg-card border border-border">
            <div className="text-3xl font-bold text-secondary">{scores.length}</div>
            <div className="text-xs text-gray-500">Scored Leads</div>
          </div>
        </div>
      )}

      {/* Agent Collaboration Callout */}
      <div className="border rounded-lg p-6 mb-6 bg-card">
        <h3 className="font-semibold mb-3">🤖 Human-Agent Collaboration</h3>
        <p className="text-sm text-gray-600 mb-3">
          This demo registers working WebMCP tools that an agent can call to orchestrate an AI SDR pipeline. The tools run against sample data (no real leads are contacted). The agent calls tools step-by-step, and you review/approve at each stage — then the agent proceeds automatically.
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>🔍 <strong>Agent</strong> searches for leads matching your criteria</li>
          <li>📋 <strong>Agent</strong> enriches each lead into a 360° dossier</li>
          <li>🎯 <strong>Agent</strong> AI-scores and ranks leads by fit</li>
          <li>✍️ <strong>Human</strong> reviews email drafts generated by agent</li>
          <li>📤 <strong>Human</strong> approves emails to send</li>
          <li>🤖 <strong>Agent</strong> sends emails and creates follow-up sequences</li>
        </ul>
      </div>
    </div>
  )
}