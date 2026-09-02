# WebMCP Tool Schemas for AIScale.pro SDR Orchestration

## Design Philosophy
Expose the AI SDR workflow as **atomically callable tools** so agents can orchestrate step-by-step in natural conversation with humans. Each tool = one logical workflow stage.

---

## Tool 1: search_leads
**Description**: Discover LinkedIn prospects matching search criteria
**InputSchema**:
```json
{
  "type": "object",
  "properties": {
    "keywords": {"type": "array", "items": {"type": "string"}, "description": "Search keywords (e.g., ['SaaS', 'Founder'])"},
    "location": {"type": "string", "description": "Geographic filter"},
    "job_title": {"type": "string", "description": "Job title filter"},
    "company_size": {"type": "string", "enum": ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"], "description": "Company size filter"},
    "industry": {"type": "string", "description": "Industry filter"},
    "max_results": {"type": "integer", "minimum": 1, "maximum": 200, "default": 50}
  },
  "required": ["keywords"]
}
```
**Returns**: `{ leads: Lead[], total_found: number, search_id: string }`

---

## Tool 2: enrich_lead
**Description**: Build a 360° dossier for a lead (company + person data)
**InputSchema**:
```json
{
  "type": "object",
  "properties": {
    "lead_id": {"type": "string", "description": "Lead ID from search_leads"},
    "include_company_scraping": {"type": "boolean", "default": true},
    "include_recent_posts": {"type": "boolean", "default": true},
    "include_tech_stack": {"type": "boolean", "default": true}
  },
  "required": ["lead_id"]
}
```
**Returns**: `{ dossier: LeadDossier, enrichment_time_ms: number }`

---

## Tool 3: score_lead
**Description**: AI-score a lead's fit using dossier data
**InputSchema**:
```json
{
  "type": "object",
  "properties": {
    "lead_id": {"type": "string"},
    "dossier": {"type": "object", "description": "Full dossier from enrich_lead"},
    "icp_criteria": {"type": "object", "description": "Ideal customer profile criteria"},
    "scoring_model": {"type": "string", "enum": ["standard", "aggressive", "conservative"], "default": "standard"}
  },
  "required": ["lead_id", "dossier"]
}
```
**Returns**: `{ score: number, rationale: string, signals: string[], tier: "A"|"B"|"C"|"D" }`

---

## Tool 4: generate_email
**Description**: Generate a hyper-personalized cold email using dossier + context
**InputSchema**:
```json
{
  "type": "object",
  "properties": {
    "lead_id": {"type": "string"},
    "dossier": {"type": "object"},
    "campaign_context": {
      "type": "object",
      "properties": {
        "value_proposition": {"type": "string"},
        "cta": {"type": "string"},
        "product_description": {"type": "string"},
        "sender_name": {"type": "string"},
        "sender_company": {"type": "string"},
        "tone": {"type": "string", "enum": ["professional", "casual", "direct", "warm"], "default": "professional"}
      },
      "required": ["value_proposition", "cta", "product_description", "sender_name", "sender_company"]
    },
    "email_type": {"type": "string", "enum": ["initial", "follow_up", "referral", "breakup"], "default": "initial"}
  },
  "required": ["lead_id", "dossier", "campaign_context"]
}
```
**Returns**: `{ subject: string, body: string, tokens_used: number, estimated_cost: number }`

---

## Tool 5: send_email
**Description**: Send an email via Resend (simulated for demo)
**InputSchema**:
```json
{
  "type": "object",
  "properties": {
    "to_email": {"type": "string", "format": "email"},
    "to_name": {"type": "string"},
    "subject": {"type": "string"},
    "body": {"type": "string"},
    "from_email": {"type": "string", "format": "email", "default": "outreach@aiscale.pro"},
    "from_name": {"type": "string", "default": "AIScale SDR"},
    "tracking_enabled": {"type": "boolean", "default": true}
  },
  "required": ["to_email", "to_name", "subject", "body"]
}
```
**Returns**: `{ email_id: string, status: "sent"|"queued", sent_at: string }`

---

## Tool 6: create_follow_up_sequence
**Description**: Set up an automated follow-up sequence for a lead
**InputSchema**:
```json
{
  "type": "object",
  "properties": {
    "lead_id": {"type": "string"},
    "lead_email": {"type": "string", "format": "email"},
    "lead_name": {"type": "string"},
    "sequence_type": {"type": "string", "enum": ["standard_3_touch", "value_add_4_touch", "breakup_2_touch", "custom"], "default": "standard_3_touch"},
    "custom_steps": {"type": "array", "items": {"type": "object", "properties": {
      "day_offset": {"type": "number"},
      "subject_template": {"type": "string"},
      "body_template": {"type": "string"}
    }}}
  },
  "required": ["lead_id", "lead_email", "lead_name"]
}
```
**Returns**: `{ sequence_id: string, steps_count: number, next_followup_at: string }`

---

## Tool 7: get_campaign_analytics
**Description**: Get real-time campaign performance metrics
**InputSchema**:
```json
{
  "type": "object",
  "properties": {
    "campaign_id": {"type": "string", "description": "Optional: filter by campaign"},
    "date_range": {"type": "object", "properties": {
      "start": {"type": "string", "format": "date"},
      "end": {"type": "string", "format": "date"}
    }}
  }
}
```
**Returns**: `{ campaigns: CampaignStats[], summary: { total_sent: number, open_rate: number, reply_rate: number, meeting_booked: number } }`

---

## Tool 8: run_full_campaign
**Description**: Execute complete SDR campaign (orchestrates all steps) - for "one-click" demo
**InputSchema**:
```json
{
  "type": "object",
  "properties": {
    "search_criteria": {"type": "object", "description": "Same as search_leads input"},
    "campaign_context": {"type": "object", "description": "Same as generate_email campaign_context"},
    "max_leads": {"type": "integer", "minimum": 1, "maximum": 100, "default": 20},
    "auto_send": {"type": "boolean", "default": false, "description": "Actually send emails (demo mode = false)"}
  },
  "required": ["search_criteria", "campaign_context"]
}
```
**Returns**: `{ campaign_id: string, status: "running"|"completed"|"failed", results: CampaignResults }`

---

## Lead Type Definitions

```typescript
interface Lead {
  id: string;
  name: string;
  headline: string;
  company: string;
  company_domain: string;
  location: string;
  linkedin_url: string;
  email?: string;
  initial_score: number;
}

interface LeadDossier {
  lead: Lead;
  company: CompanyData;
  person: PersonData;
  tech_stack: string[];
  recent_news: NewsItem[];
  funding_info: FundingData;
  competitor_analysis: CompetitorData;
}

interface CampaignResults {
  discovered: number;
  enriched: number;
  scored: number;
  emails_generated: number;
  emails_sent: number;
  sequences_created: number;
  leads: EnrichedLead[];
}

interface CampaignStats {
  campaign_id: string;
  name: string;
  sent: number;
  opened: number;
  replied: number;
  meetings_booked: number;
  open_rate: number;
  reply_rate: number;
  avg_response_time_hours: number;
}
```

---

## Agent-Friendly Usage Pattern

An agent can now do this in conversation:

```
Human: "Find me 20 SaaS founders in the US and send them a personalized outreach"
Agent: 
  1. search_leads({keywords: ["SaaS", "Founder"], location: "United States", max_results: 20})
  2. for each lead: enrich_lead({lead_id})
  3. for each lead: score_lead({lead_id, dossier})
  4. filter top 10 by score
  5. for each: generate_email({...})
  6. present drafts to human for approval
  7. on approval: send_email({...})
  8. create_follow_up_sequence({...})
  9. get_campaign_analytics({})
```

This demonstrates **human-agent collaboration** perfectly!