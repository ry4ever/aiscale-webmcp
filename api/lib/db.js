// Database layer using @vercel/postgres for Vercel serverless
import { sql } from '@vercel/postgres';

// Initialize database tables
export async function init() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        headline TEXT,
        company VARCHAR,
        company_domain VARCHAR,
        location VARCHAR,
        linkedin_url TEXT,
        initial_score INTEGER,
        tags JSONB DEFAULT '[]'::jsonb,
        email VARCHAR,
        status VARCHAR DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        enriched_at TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        search_criteria JSONB DEFAULT '{}'::jsonb,
        campaign_context JSONB DEFAULT '{}'::jsonb,
        max_leads INTEGER,
        auto_send BOOLEAN DEFAULT false,
        status VARCHAR DEFAULT 'pending',
        results JSONB,
        created_by VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS emails (
        id VARCHAR PRIMARY KEY,
        to_email VARCHAR NOT NULL,
        to_name VARCHAR,
        subject TEXT,
        body TEXT,
        from_email VARCHAR,
        from_name VARCHAR,
        campaign_id VARCHAR REFERENCES campaigns(id),
        lead_id VARCHAR REFERENCES leads(id),
        email_id VARCHAR,
        status VARCHAR DEFAULT 'pending',
        opened BOOLEAN DEFAULT false,
        clicked BOOLEAN DEFAULT false,
        replied BOOLEAN DEFAULT false,
        sent_at TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sequences (
        id VARCHAR PRIMARY KEY,
        campaign_id VARCHAR REFERENCES campaigns(id),
        lead_id VARCHAR REFERENCES leads(id),
        sequence_type VARCHAR,
        steps_count INTEGER,
        steps JSONB DEFAULT '[]'::jsonb,
        next_followup_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        campaign_id VARCHAR REFERENCES campaigns(id),
        lead_id VARCHAR REFERENCES leads(id),
        tool_name VARCHAR,
        action VARCHAR,
        status VARCHAR,
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)`;

    console.log('[DB] Tables initialized');
  } catch (error) {
    console.error('[DB] Init error:', error);
    throw error;
  }
}

// ==================== LEADS ====================

export async function getAllLeads() {
  const result = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
  return result.rows;
}

export async function createLead(lead) {
  const result = await sql`
    INSERT INTO leads (id, name, company, email, status, initial_score)
    VALUES (${lead.id}, ${lead.name}, ${lead.company || ''}, ${lead.email || ''}, ${lead.status || 'pending'}, ${lead.initial_score || 0})
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateLead(id, updates) {
  const result = await sql`
    UPDATE leads SET status = COALESCE(${updates.status}, status) WHERE id = ${id} RETURNING *
  `;
  return result.rows[0] || null;
}

// ==================== CAMPAIGNS ====================

export async function getAllCampaigns() {
  const result = await sql`SELECT * FROM campaigns ORDER BY created_at DESC`;
  return result.rows;
}

export async function createCampaign(campaign) {
  const result = await sql`
    INSERT INTO campaigns (id, name, status, search_criteria, campaign_context, max_leads, auto_send, created_by, created_at)
    VALUES (
      ${campaign.id},
      ${campaign.name},
      ${campaign.status || 'running'},
      ${JSON.stringify(campaign.search_criteria || {})}::jsonb,
      ${JSON.stringify(campaign.campaign_context || {})}::jsonb,
      ${campaign.max_leads || 50},
      ${campaign.auto_send || false},
      ${campaign.created_by || 'anonymous'},
      NOW()
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function getCampaign(id) {
  const result = await sql`SELECT * FROM campaigns WHERE id = ${id}`;
  return result.rows[0] || null;
}

// ==================== EMAILS ====================

export async function createEmail(emailData) {
  const result = await sql`
    INSERT INTO emails (id, to_email, to_name, subject, body, from_email, from_name, campaign_id, lead_id, email_id, status, sent_at)
    VALUES (
      ${emailData.id},
      ${emailData.to_email},
      ${emailData.to_name || ''},
      ${emailData.subject},
      ${emailData.body},
      ${emailData.from_email || 'outreach@aiscale.pro'},
      ${emailData.from_name || 'AIScale SDR'},
      ${emailData.campaign_id || null},
      ${emailData.lead_id || null},
      ${emailData.email_id || ''},
      ${emailData.status || 'sent'},
      NOW()
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function getEmails() {
  const result = await sql`SELECT * FROM emails ORDER BY sent_at DESC`;
  return result.rows;
}

// ==================== SEQUENCES ====================

export async function createSequence(sequence) {
  const result = await sql`
    INSERT INTO sequences (id, campaign_id, lead_id, sequence_type, steps_count, steps, next_followup_at, created_at)
    VALUES (
      ${sequence.id},
      ${sequence.campaign_id || null},
      ${sequence.lead_id || null},
      ${sequence.sequence_type || 'standard_3_touch'},
      ${sequence.steps_count || 3},
      ${JSON.stringify(sequence.steps || [])}::jsonb,
      ${sequence.next_followup_at || null},
      NOW()
    )
    RETURNING *
  `;
  return result.rows[0];
}

// ==================== ACTIVITY ====================

export async function addActivityLog(entry) {
  const result = await sql`
    INSERT INTO activity_log (campaign_id, lead_id, tool_name, action, status, details, created_at)
    VALUES (
      ${entry.campaign_id || null},
      ${entry.lead_id || null},
      ${entry.tool_name},
      ${entry.action},
      ${entry.status || 'success'},
      ${JSON.stringify(entry.details || {})}::jsonb,
      NOW()
    )
    RETURNING *
  `;
  return result.rows[0];
}

// ==================== ANALYTICS ====================

export async function getCampaignAnalytics(campaign_id) {
  let result;
  if (campaign_id) {
    result = await sql`
      SELECT
        COUNT(DISTINCT e.id) as sent,
        COUNT(DISTINCT CASE WHEN e.opened THEN e.id END) as opened,
        COUNT(DISTINCT CASE WHEN e.replied THEN e.id END) as replied,
        CASE WHEN COUNT(DISTINCT e.id) > 0
          THEN ROUND(COUNT(DISTINCT CASE WHEN e.opened THEN e.id END)::numeric * 100 / COUNT(DISTINCT e.id), 1)
          ELSE 0 END as open_rate,
        CASE WHEN COUNT(DISTINCT e.id) > 0
          THEN ROUND(COUNT(DISTINCT CASE WHEN e.replied THEN e.id END)::numeric * 100 / COUNT(DISTINCT e.id), 1)
          ELSE 0 END as reply_rate
      FROM emails e WHERE e.campaign_id = ${campaign_id}
    `;
  } else {
    result = await sql`
      SELECT
        COUNT(DISTINCT e.id) as sent,
        COUNT(DISTINCT CASE WHEN e.opened THEN e.id END) as opened,
        COUNT(DISTINCT CASE WHEN e.replied THEN e.id END) as replied,
        CASE WHEN COUNT(DISTINCT e.id) > 0
          THEN ROUND(COUNT(DISTINCT CASE WHEN e.opened THEN e.id END)::numeric * 100 / COUNT(DISTINCT e.id), 1)
          ELSE 0 END as open_rate,
        CASE WHEN COUNT(DISTINCT e.id) > 0
          THEN ROUND(COUNT(DISTINCT CASE WHEN e.replied THEN e.id END)::numeric * 100 / COUNT(DISTINCT e.id), 1)
          ELSE 0 END as reply_rate
      FROM emails e
    `;
  }
  const row = result.rows[0];
  return {
    total_sent: Number(row?.sent || 0),
    total_opened: Number(row?.opened || 0),
    total_replied: Number(row?.replied || 0),
    meetings_booked: 0,
    open_rate: Number(row?.open_rate || 0),
    reply_rate: Number(row?.reply_rate || 0),
    campaign_id: campaign_id || 'all',
  };
}

export async function getDashboardStats() {
  try {
    const campaigns = await getAllCampaigns();
    const leads = await getAllLeads();
    const sent = campaigns.reduce((sum, c) => sum + (c.sent || 0), 0);
    const opened = campaigns.reduce((sum, c) => sum + (c.opened || 0), 0);
    const replied = campaigns.reduce((sum, c) => sum + (c.replied || 0), 0);
    const booked = campaigns.reduce((sum, c) => sum + (c.booked || 0), 0);
    return {
      total_campaigns: campaigns.length,
      total_leads: leads.length,
      total_sent: sent,
      total_opened: opened,
      total_replied: replied,
      total_booked: booked,
      overall_open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      overall_reply_rate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
      meeting_booked_rate: sent > 0 ? Math.round((booked / sent) * 100) : 0,
    };
  } catch (e) {
    return {
      total_campaigns: 0,
      total_leads: 0,
      total_sent: 0,
      total_opened: 0,
      total_replied: 0,
      total_booked: 0,
      overall_open_rate: 0,
      overall_reply_rate: 0,
      meeting_booked_rate: 0,
    };
  }
}