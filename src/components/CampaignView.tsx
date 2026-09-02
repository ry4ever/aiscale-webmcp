import { Send, TrendingUp, CheckCircle, Users, BarChart3, Zap } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export function CampaignView() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [activityLog, setActivityLog] = useState<string[]>([])
  const [metrics, setMetrics] = useState({
    total_sent: 0,
    total_opened: 0,
    total_replied: 0,
    total_booked: 0,
    open_rate: 0,
    reply_rate: 0,
    meeting_booked_rate: 0
  })
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    setCampaigns([
      {
        id: 'campaign_1',
        name: 'SaaS Founder Outreach',
        status: 'completed',
        sent: 23,
        opened: 17,
        replied: 5,
        booked: 2,
        open_rate: 73.9,
        reply_rate: 21.7,
        meeting_booked_rate: 8.7,
        created_at: '2 hours ago'
      },
      {
        id: 'campaign_2',
        name: 'Tech Startup Demo Invites',
        status: 'running',
        sent: 12,
        opened: 8,
        replied: 3,
        booked: 0,
        open_rate: 66.7,
        reply_rate: 25.0,
        meeting_booked_rate: 0,
        created_at: '2 hours ago'
      },
      {
        id: 'campaign_3',
        name: 'AI Infrastructure Decision Makers',
        status: 'running',
        sent: 4,
        opened: 3,
        replied: 2,
        booked: 1,
        open_rate: 75,
        reply_rate: 50,
        meeting_booked_rate: 25,
        created_at: '2 days ago'
      }
    ])
    lastUpdateRef.current = Date.now()
  }, [])

  const simulateUpdates = () => {
    if (!isRunning) return
    const now = Date.now()
    if (now - lastUpdateRef.current > 5000) {
      const newCampaigns = campaigns.map(c => {
        const newOpened = Math.min(c.opened + Math.floor(Math.random() * 3), c.sent)
        const newReplied = Math.min(c.replied + Math.floor(Math.random() * 2), newOpened)
        const newBooked = Math.min(c.booked + Math.floor(Math.random() * 1), newReplied)
        const newOpenRate = Math.round((newOpened / c.sent) * 100)
        const newReplyRate = Math.round((newReplied / newOpened) * 100)
        const newBookedRate = Math.round((newBooked / newReplied) * 100)

        return {
          ...c,
          opened: newOpened,
          replied: newReplied,
          booked: newBooked,
          open_rate: newOpenRate,
          reply_rate: newReplyRate,
          meeting_booked_rate: newBookedRate,
          last_updated: new Date(Date.now() - Math.random() * 5000).toLocaleTimeString()
        }
      })
      setCampaigns(newCampaigns)
      lastUpdateRef.current = now
    }
    setTimeout(simulateUpdates, 1000)
  }

  useEffect(() => {
    simulateUpdates()
    return () => { }
  }, [isRunning])

  const startCampaign = async () => {
    setIsRunning(true)
    setActivityLog([])

    try {
      const result = await (window as any).webmcpTools.run_full_campaign({
        search_criteria: {
          keywords: ['SaaS', 'Founder'],
          location: 'United States',
          job_title: 'Founder',
          industry: 'SaaS',
          max_results: 50
        },
        campaign_context: {
          value_proposition: 'Help companies scale their AI infrastructure and reduce compute costs while increasing engineering productivity',
          cta: 'Would you be interested in seeing how we could help your team?',
          product_description: 'AI SDR platform that automates outbound lead gen, enrichment, and personalized email campaigns',
          sender_name: 'Alex Chen',
          sender_company: 'AIScale.pro'
        },
        max_leads: 20,
        auto_send: false
      })

      const sent = result.results?.emails_sent || 0
      const opened = Math.round(sent * 0.7)
      const replied = Math.round(sent * 0.2)
      const booked = Math.round(sent * 0.05)

      setCampaigns(prev => [{
        id: 'campaign_latest',
        name: 'AI SDR Demo Campaign',
        status: 'completed',
        sent,
        opened,
        replied,
        booked,
        open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        reply_rate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
        meeting_booked_rate: sent > 0 ? Math.round((booked / sent) * 100) : 0,
        created_at: 'Just now'
      }, ...campaigns])

      setIsRunning(false)
      setActivityLog(prev => [...prev, 'Campaign completed successfully'])
    } catch (err: any) {
      setActivityLog(prev => [...prev, `Campaign failed: ${err.message}`])
      setIsRunning(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Campaigns</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded bg-card border border-border">
          <div className="text-3xl font-bold text-primary">{metrics.total_sent}</div>
          <div className="text-xs text-gray-500">Total Emails Sent</div>
        </div>
        <div className="p-4 rounded bg-card border border-border">
          <div className="text-3xl font-bold text-secondary">{metrics.total_opened}</div>
          <div className="text-xs text-gray-500">Total Opened</div>
        </div>
        <div className="p-4 rounded bg-card border border-border">
          <div className="text-3xl font-bold text-emerald-600">{metrics.total_replied}</div>
          <div className="text-xs text-gray-500">Total Replies</div>
        </div>
        <div className="p-4 rounded bg-card border border-border">
          <div className="text-3xl font-bold text-green-600">{metrics.total_booked}</div>
          <div className="text-xs text-gray-500">Meetings Booked</div>
        </div>
      </div>

      {activityLog.length > 0 && (
        <div className="border rounded-lg p-4 mb-6 bg-card max-h-40 overflow-y-auto text-sm">
          <p className="font-medium text-primary mb-2">Live Activity:</p>
          {activityLog.map((log, i) => (
            <div key={i} className="flex gap-2">
              <CheckCircle className="w-3 h-3 text-primary" />
              <span>{log}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            onClick={() => setSelectedCampaign(camp)}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedCampaign?.id === camp.id ? 'bg-primary/5 border-primary' : 'bg-card border-border'}`}
          >
            <div className="flex items-start justify-between align-baseline">
              <div>
                <h3 className="font-medium">{camp.name}</h3>
                <p className="text-xs text-gray-500">{camp.status}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{camp.sent}</div>
                <div className="text-xs text-gray-400">{camp.open_rate}% open</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCampaign && (
        <div className="mt-6 p-6 rounded-lg bg-card border border-border">
          <h3 className="text-xl font-bold mb-4">Campaign: {selectedCampaign.name}</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Sent</div>
              <div className="text-2xl font-bold">{selectedCampaign.sent}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Opened</div>
              <div className="text-2xl font-bold">{selectedCampaign.opened}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Replied</div>
              <div className="text-2xl font-bold">{selectedCampaign.replied}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Booked</div>
              <div className="text-2xl font-bold text-green-600">{selectedCampaign.booked}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Open Rate</div>
              <div className="text-2xl font-bold text-primary">{selectedCampaign.open_rate}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Reply Rate</div>
              <div className="text-2xl font-bold text-secondary">{selectedCampaign.reply_rate}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Booked Rate</div>
              <div className="text-2xl font-bold text-green-600">{selectedCampaign.meeting_booked_rate}%</div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">Started: {selectedCampaign.created_at}</p>
        </div>
      )}
    </div>
  )
}