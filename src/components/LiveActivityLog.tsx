import { useEffect, useState, useRef } from 'react'
import { Bot, User, CheckCircle, AlertCircle, Search, Mail, Target } from 'lucide-react'

interface ActivityEntry {
  id: string
  type: 'agent' | 'human' | 'tool_call' | 'system'
  actor: string
  action: string
  detail: string
  timestamp: Date
  status: 'success' | 'pending' | 'failed'
}

const generateActivity = (count: number): ActivityEntry[] => {
  const types: { type: ActivityEntry['type']; actor: string; action: string; detail: string; status: 'success' | 'pending' | 'failed' }[] = [
    { type: 'agent', actor: 'Agent', action: 'Called search_leads', detail: 'keywords: ["SaaS", "Founder"], max_results: 20', status: 'success' },
    { type: 'tool_call', actor: 'Tool: search_leads', action: 'Returned 20 leads', detail: 'ID: search_1725123456', status: 'success' },
    { type: 'agent', actor: 'Agent', action: 'Called enrich_lead', detail: 'for lead lead_1725123456_0', status: 'success' },
    { type: 'tool_call', actor: 'Tool: enrich_lead', action: 'Built 360° dossier', detail: 'in 1,247ms - company + person + tech stack', status: 'success' },
    { type: 'agent', actor: 'Agent', action: 'Called score_lead', detail: 'tier: A, score: 87/100', status: 'success' },
    { type: 'human', actor: 'Human', action: 'Reviewed email draft', detail: 'Approved: "Quick intro from Alex Chen at AIScale.pro"', status: 'success' },
    { type: 'agent', actor: 'Agent', action: 'Called send_email', detail: 'to: alex@techflow.com', status: 'success' },
    { type: 'agent', actor: 'Agent', action: 'Called create_follow_up_sequence', detail: '3-step sequence scheduled', status: 'pending' },
  ]

  return Array.from({ length: count }, (_, i) => {
    const t = types[i % types.length]
    return {
      id: `act_${i}`,
      ...t,
      timestamp: new Date(Date.now() - (count - i) * 30000)
    }
  })
}

export function LiveActivityLog() {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'agent' | 'human' | 'tool_call'>('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActivities(generateActivity(30))
    const interval = setInterval(() => {
      setActivities(prev => {
        const newEntry: ActivityEntry = {
          id: `act_${Date.now()}`,
          type: 'tool_call',
          actor: 'Tool: enrich_lead',
          action: 'New dossier built',
          detail: 'for lead_1725123456_' + Math.floor(Math.random() * 20),
          timestamp: new Date(),
          status: 'success'
        }
        return [newEntry, ...prev].slice(0, 50)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: ActivityEntry['type'], status: ActivityEntry['status']) => {
    if (status === 'pending') return <AlertCircle className="w-4 h-4 text-yellow-500" />
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-error" />
    if (type === 'agent') return <Bot className="w-4 h-4 text-primary" />
    if (type === 'human') return <User className="w-4 h-4 text-secondary" />
    if (type === 'tool_call') return <CheckCircle className="w-4 h-4 text-emerald-600" />
    return <Search className="w-4 h-4 text-gray-500" />
  }

  const filteredActivities = activities.filter(a => filter === 'all' || a.type === filter)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Agent Activity Log</h2>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'agent', 'human', 'tool_call'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${filter === f ? 'bg-primary text-white' : 'bg-card text-gray-600 border border-border'}`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div ref={scrollRef} className="border rounded-lg bg-card p-4 space-y-2 max-h-[600px] overflow-y-auto">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded border border-border hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0 mt-0.5">{getIcon(activity.type, activity.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{activity.actor}</span>
                <span className="text-gray-500 text-xs">{activity.action}</span>
              </div>
              <p className="text-xs text-gray-500 break-words">{activity.detail}</p>
              <span className="text-xs text-gray-400 mt-1">
                {activity.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {filteredActivities.length === 0 && (
          <p className="text-center text-gray-500 py-8">No activities yet</p>
        )}
      </div>

      {/* Agent Activity Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-card border border-border">
          <div className="text-2xl font-bold text-primary">
            {activities.filter(a => a.type === 'agent').length}
          </div>
          <div className="text-xs text-gray-500">Agent Actions</div>
        </div>
        <div className="p-4 rounded bg-card border border-border">
          <div className="text-2xl font-bold text-emerald-600">
            {activities.filter(a => a.type === 'tool_call').length}
          </div>
          <div className="text-xs text-gray-500">Tool Calls</div>
        </div>
        <div className="p-4 rounded bg-card border border-border">
          <div className="text-2xl font-bold text-secondary">
            {activities.filter(a => a.type === 'human').length}
          </div>
          <div className="text-xs text-gray-500">Human Approvals</div>
        </div>
        <div className="p-4 rounded bg-card border border-border">
          <div className="text-2xl font-bold text-emerald-600">
            {activities.filter(a => a.status === 'success').length}
          </div>
          <div className="text-xs text-gray-500">Successful Ops</div>
        </div>
      </div>
    </div>
  )
}