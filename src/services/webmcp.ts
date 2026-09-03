// WebMCP Tool Registration for AIScale.pro SDR Platform
// This demonstrates how agents can orchestrate outbound sales campaigns

// ============================================================================
// WEB MCP TOOL 1: Search Leads
// ============================================================================
export const searchLeads = {
  name: "search_leads",
  description: "Discover LinkedIn prospects matching specific criteria. An agent can use this to find leads for outreach campaigns. Returns verified leads with LinkedIn profiles and email addresses.",
  inputSchema: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Search keywords (e.g., ['SaaS', 'Founder', 'AI'])",
      },
      location: {
        type: "string",
        description: "Geographic filter (e.g., 'United States', 'San Francisco, CA')"
      },
      job_title: {
        type: "string",
        description: "Job title filter (e.g., 'CEO', 'Founder', 'CTO')"
      },
      company_size: {
        type: "string",
        enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
        description: "Company size filter"
      },
      industry: {
        type: "string",
        description: "Industry filter (e.g., 'SaaS', 'Fintech', 'Healthcare')"
      },
      max_results: {
        type: "integer",
        minimum: 1,
        maximum: 200,
        default: 50
      }
    },
    required: ["keywords"]
  },

  execute: async (input: {
    keywords: string[],
    location?: string,
    job_title?: string,
    company_size?: string,
    industry?: string,
    max_results?: number
  }): Promise<{ leads: Lead[], total_found: number, search_id: string }> => {
    // Simulate real API call - in production this would call LinkedIn via Apify/Crawls
    await new Promise(r => setTimeout(r, 800))

    const tags = [...input.keywords]
    if (input.job_title) tags.push(input.job_title)
    if (input.industry) tags.push(input.industry)

    const sampleLeads: Lead[] = Array.from({ length: input.max_results || 50 }, (_, i) => ({
      id: `lead_${Date.now()}_${i}`,
      name: `${['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan'][i % 5]} ${['Smith', 'Jones', 'Lee', 'Patel', 'Garcia'][i % 5]}`,
      headline: input.job_title === 'CEO'
        ? 'CEO @ TechFlow Solutions'
        : input.job_title === 'Founder'
          ? 'Founder @ StartupXYZ'
          : `${input.job_title || 'Tech Professional'} | Innovative SaaS Leader`,
      company: input.company_size === '1-10'
        ? 'StartupBite'
        : input.company_size === '11-50'
          ? 'GrowthScale'
          : input.company_size === '51-200'
            ? 'EnterpriseForge'
            : 'MegaCorpAI',
      company_domain: 'techflow.com',
      location: input.location || 'San Francisco, CA',
      linkedin_url: `https://linkedin.com/in/lead${i}`,
      initial_score: Math.floor(Math.random() * 50) + 50,
      tags
    }))

    console.log(`[WebMCP] Agent used search_leads: ${tags.join(', ')} → ${sampleLeads.length} leads`)

    return {
      leads: sampleLeads,
      total_found: sampleLeads.length,
      search_id: `search_${Date.now()}`
    }
  }
}

// ============================================================================
// WEB MCP TOOL 2: Enrich Lead
// ============================================================================
export const enrichLead = {
  name: "enrich_lead",
  description: "Build a comprehensive 360-degree dossier on a lead including company data, social presence, tech stack, and recent news.",
  inputSchema: {
    type: "object",
    properties: {
      lead_id: { type: "string", description: "Lead ID from search_leads" },
      include_company_scraping: { type: "boolean", default: true },
      include_recent_posts: { type: "boolean", default: true },
      include_tech_stack: { type: "boolean", default: true }
    },
    required: ["lead_id"]
  },

  execute: async (input: { lead_id: string, include_company_scraping?: boolean, include_recent_posts?: boolean, include_tech_stack?: boolean }): Promise<{ dossier: LeadDossier, enrichment_time_ms: number }> => {
    const startTime = Date.now()

    // Simulate web scraping and enrichment
    await new Promise(r => setTimeout(r, 1500))

    const lead = await getLeadById(input.lead_id)
    const dossier: LeadDossier = {
      lead,
      company: {
        name: lead.company,
        domain: lead.company_domain,
        employees: Math.floor(Math.random() * 200) + 20,
        revenue_estimate: `$${(Math.random() * 50 + 10).toFixed(2)}M`,
        tech_stack: ['React', 'Node.js', 'AWS', 'Vercel'],
        funding_raised: `$${(Math.random() * 100 + 5).toFixed(2)}M`,
        growth_rate: `${Math.floor(Math.random() * 50 + 100)}% YoY`,
        competitors: ['CompetitorA', 'CompetitorB']
      },
      person: {
        name: lead.name,
        title: lead.headline,
        profile_url: lead.linkedin_url,
        email: `${lead.name.toLowerCase().split(' ').join('.')}@${lead.company.toLowerCase()}com`,
        location: lead.location,
        experience_years: Math.floor(Math.random() * 15) + 3,
        education: ['Stanford University', 'Product Management'],
        social_influence_score: Math.random(),
        recent_posts: [{
          title: 'Thoughts on AI scaling',
          excerpt: 'How we reduced infra costs by 40% while scaling...',
          url: 'https://linkedin.com/posts/...'
        }]
      },
      tech_stack: ['LGTM', 'Vercel', 'AI SDKs'],
      recent_news: [{ headline: 'Company raises Series B', snippet: 'Funding for expansion', url: '#' }],
      scoring_signals: {
        growth_mindset: 0.92,
        recent_hire: true,
        funding_stage: 'Series A-B'
      }
    }

    console.log(`[WebMCP] Agent enriched lead ${lead.name} → complete dossier`)

    return {
      dossier,
      enrichment_time_ms: Date.now() - startTime
    }
  }
}

// ============================================================================
// WEB MCP TOOL 3: Score Lead
// ============================================================================
export const scoreLead = {
  name: "score_lead",
  description: "AI-score a lead's fit using your Ideal Customer Profile criteria and dossier data. Returns a tier (A-D) with detailed rationale.",
  inputSchema: {
    type: "object",
    properties: {
      lead_id: { type: "string" },
      dossier: { type: "object" },
      icp_criteria: {
        type: "object",
        properties: {
          company_size: { type: "string" },
          industry: { type: "string" },
          min_revenue: { type: "number" },
          relevant_tech: { type: "array", items: { type: "string" } }
        }
      },
      scoring_model: {
        type: "string",
        enum: ["standard", "aggressive", "conservative"],
        default: "standard"
      }
    },
    required: ["lead_id", "dossier"]
  },

  execute: async (input: { lead_id: string, dossier: LeadDossier, icp_criteria?: any, scoring_model?: string }): Promise<{ score: number, rationale: string, signals: string[], tier: "A" | "B" | "C" | "D" }> => {
    await new Promise(r => setTimeout(r, 600))

    const company = input.dossier.company
    const score = Math.floor(Math.random() * 40) + 60
    const tier = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D'

    const signals = [
      `Company size ${company.employees}+ employees`,
      `Funding stage: ${company.funding_raised} raised`,
      `Growing ${company.growth_rate} YoY`,
      `Using modern stack: ${company.tech_stack.slice(0, 3).join(', ')}`
    ]

    const rationale = tier === 'A'
      ? "Strong fit: high growth company using relevant tech stack, perfect ICP match"
      : tier === 'B'
        ? "Good fit: company meets core ICP criteria, room for optimization"
        : "Needs manual review: missing key signals"

    console.log(`[WebMCP] Agent scored lead → ${tier} tier (${score})`)

    return { score, rationale, signals, tier }
  }
}

// ============================================================================
// WEB MCP TOOL 4: Generate Email
// ============================================================================
export const generateEmail = {
  name: "generate_email",
  description: "Generate a hyper-personalized cold email using lead dossier and campaign context. Outputs subject line and email body optimized for response rate.",
  inputSchema: {
    type: "object",
    properties: {
      lead_id: { type: "string" },
      dossier: { type: "object" },
      campaign_context: {
        type: "object",
        properties: {
          value_proposition: { type: "string" },
          cta: { type: "string" },
          product_description: { type: "string" },
          sender_name: { type: "string" },
          sender_company: { type: "string" },
          tone: { type: "string", enum: ["professional", "casual", "direct", "warm"], default: "professional" }
        },
        required: ["value_proposition", "cta", "product_description", "sender_name", "sender_company"]
      },
      email_type: { type: "string", enum: ["initial", "follow_up", "referral", "breakup"], default: "initial" }
    },
    required: ["lead_id", "dossier", "campaign_context"]
  },

  execute: async (input: {
    lead_id: string,
    dossier: LeadDossier,
    campaign_context: { value_proposition: string, cta: string, product_description: string, sender_name: string, sender_company: string, tone: string },
    email_type?: string
  }): Promise<{ subject: string, body: string, tokens_used: number, estimated_cost: number }> => {
    const person = input.dossier.person
    const company = input.dossier.company

    const templates = {
      professional: {
        subject: `Quick intro from ${input.campaign_context.sender_name} at ${input.campaign_context.sender_company}`,
        body: `Hi ${person.name},

I noticed ${input.dossier.lead.company} is doing interesting work in scaling their tech stack. As someone helping companies like yours scale AI infrastructure, I thought you might find our approach useful.

${input.campaign_context.value_proposition}

${input.campaign_context.cta}

Best,
${input.campaign_context.sender_name}
${input.campaign_context.sender_company}`
      },
      warm: {
        subject: `How ${company.name} scaled their outbound in 2024`,
        body: `${person.name},

Congrats on the recent growth at ${company.name}! I helped similar SaaS founders scale their outbound without adding headcount — specifically reducing email infrastructure costs by 40% while increasing response rates.

${input.campaign_context.value_proposition}

Would love to share what worked for teams like yours.

${input.campaign_context.cta}

Cheers,
${input.campaign_context.sender_name}`
      }
    }

    const tone = input.campaign_context.tone as keyof typeof templates
    const template = templates[tone] || templates.professional

    const bodyHtml = template.body
      .replace(/\n/g, '<br>\n')

    const tokensUsed = Math.ceil((template.subject.length + template.body.length) / 4)
    const estimatedCost = (tokensUsed / 1000) * 0.00015

    console.log(`[WebMCP] Agent generated email for ${person.name} → ${template.subject}`)

    return {
      subject: template.subject,
      body: template.body,
      tokens_used: tokensUsed,
      estimated_cost: Number(estimatedCost.toFixed(4))
    }
  }
}

// ============================================================================
// WEB MCP TOOL 5: Send Email (Simulated for Demo)
// ============================================================================
export const sendEmail = {
  name: "send_email",
  description: "Send an email via Resend. In demo mode, this simulates sending for safety. Returns email ID for tracking.",
  inputSchema: {
    type: "object",
    properties: {
      to_email: { type: "string", format: "email" },
      to_name: { type: "string" },
      subject: { type: "string" },
      body: { type: "string" },
      from_email: { type: "string", format: "email", default: "outreach@aiscale.pro" },
      from_name: { type: "string", default: "AIScale SDR" },
      tracking_enabled: { type: "boolean", default: true }
    },
    required: ["to_email", "to_name", "subject", "body"]
  },

  execute: async (input: {
    to_email: string,
    to_name: string,
    subject: string,
    body: string,
    from_email?: string,
    from_name?: string,
    tracking_enabled?: boolean
  }): Promise<{ email_id: string, status: "sent" | "queued", sent_at: string }> => {
    // In production: call Resend API
    // For demo: simulate with delay
    await new Promise(r => setTimeout(r, 300))

    const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

    console.log(`[WebMCP] Agent sent email to ${input.to_name} <${input.to_email}>`)

    return {
      email_id: emailId,
      status: "sent",
      sent_at: new Date().toISOString()
    }
  }
}

// ============================================================================
// WEB MCP TOOL 6: Create Follow-up Sequence
// ============================================================================
export const createFollowUpSequence = {
  name: "create_follow_up_sequence",
  description: "Set up an automated follow-up sequence for a lead. Sequences trigger based on response/non-response.",
  inputSchema: {
    type: "object",
    properties: {
      lead_id: { type: "string" },
      lead_email: { type: "string", format: "email" },
      lead_name: { type: "string" },
      sequence_type: {
        type: "string",
        enum: ["standard_3_touch", "value_add_4_touch", "breakup_2_touch", "custom"],
        default: "standard_3_touch"
      },
      custom_steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day_offset: { type: "number" },
            subject_template: { type: "string" },
            body_template: { type: "string" }
          }
        }
      }
    },
    required: ["lead_id", "lead_email", "lead_name"]
  },

  execute: async (input: { lead_id: string, lead_email: string, lead_name: string, sequence_type?: string, custom_steps?: any[] }): Promise<{ sequence_id: string, steps_count: number, next_followup_at: string }> => {
    await new Promise(r => setTimeout(r, 400))

    const steps = input.custom_steps || [
      { day_offset: 3, subject_template: `Quick follow-up, ${input.lead_name}`, body_template: "Just checking in..." },
      { day_offset: 7, subject_template: `One thing I think you'd find useful`, body_template: "Thought you might like this..." },
      { day_offset: 14, subject_template: `Last attempt, ${input.lead_name}`, body_template: "Last email before I stop..." }
    ]

    const nextFollowup = new Date(Date.now() + steps[0].day_offset * 24 * 60 * 60 * 1000).toISOString()

    console.log(`[WebMCP] Agent created sequence ${input.sequence_type} → ${steps.length} steps for ${input.lead_name}`)

    return {
      sequence_id: `seq_${Date.now()}`,
      steps_count: steps.length,
      next_followup_at: nextFollowup
    }
  }
}

// ============================================================================
// WEB MCP TOOL 7: Run Full Campaign (Orchestrates all steps)
// ============================================================================
export const runFullCampaign = {
  name: "run_full_campaign",
  description: "Execute complete SDR campaign - orchestrates search, enrich, score, generate, send, and follow-up in one call",
  inputSchema: {
    type: "object",
    properties: {
      search_criteria: {
        type: "object",
        description: "Same as search_leads input",
        properties: {
          keywords: { type: "array", items: { type: "string" } },
          location: { type: "string" },
          job_title: { type: "string" },
          company_size: { type: "string", enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"] },
          industry: { type: "string" },
          max_results: { type: "integer", minimum: 1, maximum: 200, default: 50 }
        },
        required: ["keywords"]
      },
      campaign_context: {
        type: "object",
        description: "Same as generate_email campaign_context",
        properties: {
          value_proposition: { type: "string" },
          cta: { type: "string" },
          product_description: { type: "string" },
          sender_name: { type: "string" },
          sender_company: { type: "string" },
          tone: { type: "string", enum: ["professional", "casual", "direct", "warm"], default: "professional" }
        },
        required: ["value_proposition", "cta", "product_description", "sender_name", "sender_company"]
      },
      max_leads: { type: "integer", minimum: 1, maximum: 100, default: 20 },
      auto_send: { type: "boolean", default: false, description: "Actually send emails (demo mode = false)" }
    },
    required: ["search_criteria", "campaign_context"]
  },

  execute: async (input: {
    search_criteria: { keywords: string[]; location?: string; job_title?: string; company_size?: string; industry?: string; max_results?: number },
    campaign_context: { value_proposition: string; cta: string; product_description: string; sender_name: string; sender_company: string; tone: string },
    max_leads?: number,
    auto_send?: boolean
  }): Promise<{ campaign_id: string; status: "running" | "completed" | "failed"; results: any }> => {
    const campaignId = `campaign_${Date.now()}`
    const startTime = Date.now()

    try {
      // Step 1: Search leads
      const searchResult = await searchLeads.execute({
        keywords: input.search_criteria.keywords,
        location: input.search_criteria.location,
        job_title: input.search_criteria.job_title,
        company_size: input.search_criteria.company_size,
        industry: input.search_criteria.industry,
        max_results: input.max_leads || 20
      })

      const leads = searchResult.leads.slice(0, input.max_leads || 20)
      let enriched = 0
      let scored = 0
      let emails_generated = 0
      let emails_sent = 0
      let sequences_created = 0
      const processedLeads: any[] = []

      // Process each lead
      for (const lead of leads) {
        // Step 2: Enrich lead
        const enrichResult = await enrichLead.execute({
          lead_id: lead.id,
          include_company_scraping: true,
          include_recent_posts: true,
          include_tech_stack: true
        })
        enriched++

        const dossier = enrichResult.dossier

        // Step 3: Score lead
        const scoreResult = await scoreLead.execute({
          lead_id: lead.id,
          dossier,
          icp_criteria: {
            company_size: input.search_criteria.company_size,
            industry: input.search_criteria.industry,
            min_revenue: 1000000,
            relevant_tech: ['React', 'Node.js', 'AWS', 'TypeScript', 'Python']
          },
          scoring_model: "standard"
        })
        scored++

        // Step 4: Generate email
        const emailResult = await generateEmail.execute({
          lead_id: lead.id,
          dossier,
          campaign_context: input.campaign_context,
          email_type: "initial"
        })
        emails_generated++

        // Step 5: Send email (if auto_send)
        if (input.auto_send && dossier.person?.email) {
          await sendEmail.execute({
            to_email: dossier.person.email,
            to_name: dossier.person.name,
            subject: emailResult.subject,
            body: emailResult.body,
            from_email: "outreach@aiscale.pro",
            from_name: "AIScale SDR",
            tracking_enabled: true
          })
          emails_sent++
        }

        // Step 6: Create follow-up sequence
        if (dossier.person?.email && dossier.person?.name) {
          await createFollowUpSequence.execute({
            lead_id: lead.id,
            lead_email: dossier.person.email,
            lead_name: dossier.person.name,
            sequence_type: "standard_3_touch"
          })
          sequences_created++
        }

        processedLeads.push({
          id: lead.id,
          name: lead.name,
          company: lead.company,
          score: scoreResult.score,
          tier: scoreResult.tier,
          email_subject: emailResult.subject,
          email_sent: input.auto_send,
          sequence_created: true
        })
      }

      console.log(`[WebMCP] Agent ran full campaign ${campaignId} → ${leads.length} leads processed`)

      return {
        campaign_id: campaignId,
        status: "completed",
        results: {
          discovered: leads.length,
          enriched,
          scored,
          emails_generated,
          emails_sent,
          sequences_created,
          leads: processedLeads,
          duration_ms: Date.now() - startTime
        }
      }
    } catch (error: any) {
      console.error(`[WebMCP] Campaign ${campaignId} failed:`, error)
      return {
        campaign_id: campaignId,
        status: "failed",
        results: { error: error.message }
      }
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
type Lead = { id: string; name: string; headline: string; company: string; company_domain: string; location: string; linkedin_url: string; initial_score: number; tags: string[] }
type LeadDossier = { lead: Lead; company: any; person: any; tech_stack: string[]; recent_news: any[]; scoring_signals: any }

async function getLeadById(id: string): Promise<Lead> {
  return {
    id, name: 'John Doe', headline: 'CEO', company: 'Contoso', company_domain: 'contoso.com', location: 'SF', linkedin_url: '#', initial_score: 75, tags: []
  }
}

// ============================================================================
// MAIN REGISTRATION - Call this to enable all tools in WebMCP
// ============================================================================
export function registerAllTools() {
  if (typeof document?.modelContext?.registerTool === 'function') {
    // WebMCP is enabled in browser
    ;[searchLeads, enrichLead, scoreLead, generateEmail, sendEmail, createFollowUpSequence, runFullCampaign].forEach(tool => {
      document.modelContext!.registerTool(tool)
    })
    console.log('[WebMCP] All 7 SDR orchestration tools registered!')
  } else {
    console.log('[WebMCP] Running in standard browser - tools available via API/bridge')
  }
}

export const WEB_MCP_TOOLS = [searchLeads, enrichLead, scoreLead, generateEmail, sendEmail, createFollowUpSequence, runFullCampaign]