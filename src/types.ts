export interface Lead {
  id: string
  name: string
  headline: string
  company: string
  company_domain: string
  location: string
  linkedin_url: string
  initial_score: number
  tags: string[]
}

export interface LeadDossier {
  lead: Lead
  company: {
    name: string
    domain: string
    employees: number
    revenue_estimate: string
    tech_stack: string[]
    funding_raised: string
    growth_rate: string
    competitors: string[]
  }
  person: {
    name: string
    title: string
    profile_url: string
    email: string
    location: string
    experience_years: number
    education: string[]
    social_influence_score: number
    recent_posts: { title: string; excerpt: string; url: string }[]
  }
  tech_stack: string[]
  recent_news: { headline: string; snippet: string; url: string }[]
  scoring_signals: {
    growth_mindset: number
    recent_hire: boolean
    funding_stage: string
  }
}

export interface CampaignResults {
  discovered: number
  enriched: number
  scored: number
  emails_generated: number
  emails_sent: number
  sequences_created: number
  leads: any[]
}

export interface CampaignStats {
  campaign_id: string
  name: string
  sent: number
  opened: number
  replied: number
  meetings_booked: number
  open_rate: number
  reply_rate: number
  avg_response_time_hours: number
}

export interface Email {
  subject: string
  body: string
  tokens_used: number
  estimated_cost: number
}

export interface WebMCPTool {
  name: string
  description: string
  inputSchema: object
  execute: (input: any) => Promise<any>
}
