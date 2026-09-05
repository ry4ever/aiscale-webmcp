// Database migration script
// Run with: npm run db:migrate

const { sql } = require('@vercel/postgres')

async function runMigration() {
  console.log('Starting database migration...')

  try {
    // Creates leads table
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
        tags JSONB DEFAULT '{}'::jsonb,
        email VARCHAR,
        status VARCHAR DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        enriched_at TIMESTAMP
      )
    `
    console.log('✓ leads table created')

    // Creates campaigns table
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
    `
    console.log('✓ campaigns table created')

    // Creates emails table
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
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ emails table created')

    // Creates sequences table
    await sql`
      CREATE TABLE IF NOT EXISTS sequences (
        id VARCHAR PRIMARY KEY,
        campaign_id VARCHAR REFERENCES campaigns(id),
        lead_id VARCHAR REFERENCES leads(id),
        sequence_type VARCHAR,
        steps_count INTEGER,
        steps JSONB DEFAULT '{}'::jsonb,
        next_followup_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✓ sequences table created')

    // Creates activity log table
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
    `
    console.log('✓ activity_log table created')

    // Creates indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_emails_campaign ON emails(campaign_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_emails_lead ON emails(lead_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_campaign ON activity_log(campaign_id)`
    console.log('✓ indexes created')

    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()