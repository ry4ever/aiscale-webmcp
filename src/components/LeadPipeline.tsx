import { Users, Search, Target, Star, TrendingUp, Mail } from 'lucide-react'

interface Lead {
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

const sampleLeads: Lead[] = Array.from({ length: 20 }, (_, i) => ({
  id: `lead_${i + 1}`,
  name: `${['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan'][i % 5]} ${['Smith', 'Jones', 'Lee', 'Patel', 'Garcia'][i % 5]}`,
  headline: ['CEO', 'Founder', 'CTO', 'VP Engineering', 'Head of Growth'][i % 5],
  company: ['TechFlow', 'StartupBite', 'GrowthScale', 'EnterpriseForge', 'MegaCorpAI'][i % 5],
  company_domain: 'techflow.com',
  location: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA'][i % 5],
  linkedin_url: `https://linkedin.com/in/lead${i + 1}`,
  initial_score: Math.floor(Math.random() * 40) + 60,
  tags: ['SaaS', 'AI', 'Founder']
}))

const tiers = [
  { label: 'A - Hot Leads', min: 85, max: 100, color: 'bg-primary', icon: Target },
  { label: 'B - Warm Leads', min: 70, max: 84, color: 'bg-secondary', icon: Star },
  { label: 'C - Cold Leads', min: 55, max: 69, color: 'bg-yellow-500', icon: TrendingUp },
  { label: 'D - Low Fit', min: 0, max: 54, color: 'bg-gray-400', icon: Users },
] as const

export function LeadPipeline() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lead Pipeline</h2>

      {/* Tier Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {tiers.map((tier) => (
          <div key={tier.label} className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <tier.icon className={`w-5 h-5 text-white ${tier.color} rounded-full p-1 bg-opacity-80`} />
              <span className="text-sm font-medium">{tier.label}</span>
            </div>
            <div className="text-3xl font-bold">
              {sampleLeads.filter(l => l.initial_score >= tier.min && l.initial_score <= tier.max).length}
            </div>
            <div className="text-xs text-gray-500">{tier.min}-{tier.max} score</div>
          </div>
        ))}
      </div>

      {/* Pipeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div key={tier.label} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className={`p-3 ${tier.color} text-white`}>
              <h3 className="font-semibold">{tier.label}</h3>
              <p className="text-sm opacity-90">{tier.min}-{tier.max} score</p>
            </div>
            <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto">
              {sampleLeads
                .filter(l => l.initial_score >= tier.min && l.initial_score <= tier.max)
                .slice(0, 8)
                .map(lead => (
                  <div key={lead.id} className="p-3 rounded border border-border hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lead.name}</p>
                        <p className="text-xs text-gray-500 truncate">{lead.headline}</p>
                        <p className="text-xs text-gray-400 truncate">{lead.company}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {lead.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-white/20 rounded text-white">
                        {lead.initial_score}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                      <button className="flex-1 py-1.5 text-xs text-primary hover:bg-primary/5 rounded transition-colors flex items-center justify-center gap-1">
                        <Search className="w-3 h-3" /> Enrich
                      </button>
                      <button className="flex-1 py-1.5 text-xs text-secondary hover:bg-secondary/5 rounded transition-colors flex items-center justify-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Agent Hint */}
      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <h3 className="font-semibold text-primary mb-2">🤖 Agent Workflow</h3>
        <p className="text-sm text-gray-600">
          An agent can automatically: Search → Enrich → Score → Rank → Generate emails → Send → Create sequences. Full pipeline management via WebMCP.
        </p>
      </div>
    </div>
  )
}