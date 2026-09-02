import { useState } from 'react'
import { Zap, CheckCircle, Code, Shield } from 'lucide-react'

type Tool = {
  name: string
  description: string
  inputSchema: any
  execute: (input: any) => any
}

export function WebMCPToolPanel() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [toolInput, setToolInput] = useState('{}')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [registered, setRegistered] = useState(false)

  const tools: Tool[] = (window as any).webmcpTools || []

  const handleRegister = () => {
    if (typeof document.modelContext?.registerTool !== 'function') {
      return
    }

    const mc = document.modelContext
    if (!mc) return

    // These tools should match the ones exposed by webmcp.ts
    const toolsToRegister = [
      {
        name: 'search_leads',
        description: 'Discover LinkedIn prospects matching criteria',
        inputSchema: { type: 'object', properties: { keywords: { type: 'array', items: { type: 'string' } } } },
        execute: async (input: any) => ({ leads: [], total_found: 0, search_id: `search_${Date.now()}` })
      },
      {
        name: 'enrich_lead',
        description: 'Build a comprehensive 360° dossier on a lead',
        inputSchema: { type: 'object', properties: { lead_id: { type: 'string' } } },
        execute: async (input: any) => ({ dossier: {}, enrichment_time_ms: 1500 })
      },
      {
        name: 'score_lead',
        description: 'AI-score a lead\'s fit using your Ideal Customer Profile criteria',
        inputSchema: { type: 'object', properties: { lead_id: { type: 'string' }, dossier: { type: 'object' } } },
        execute: async (input: any) => ({ score: 85, rationale: '', signals: [], tier: 'A' as const })
      },
      {
        name: 'generate_email',
        description: 'Generate a hyper-personalized cold email using lead dossier and campaign context',
        inputSchema: { type: 'object', properties: { lead_id: { type: 'string' }, campaign_context: { type: 'object' } } },
        execute: async (input: any) => ({ subject: '', body: '', tokens_used: 0, estimated_cost: 0 })
      },
      {
        name: 'send_email',
        description: 'Send an email via Resend',
        inputSchema: { type: 'object', properties: { to_email: { type: 'string' }, to_name: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } } },
        execute: async (input: any) => ({ email_id: `email_${Date.now()}`, status: 'sent' as const, sent_at: new Date().toISOString() })
      },
      {
        name: 'create_follow_up_sequence',
        description: 'Set up an automated follow-up sequence for a lead',
        inputSchema: { type: 'object', properties: { lead_id: { type: 'string' }, lead_email: { type: 'string' }, lead_name: { type: 'string' } } },
        execute: async (input: any) => ({ sequence_id: `seq_${Date.now()}`, steps_count: 3, next_followup_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() })
      }
    ]

    toolsToRegister.forEach(tool => mc.registerTool(tool))
    setRegistered(true)
  }

  const handleRun = async () => {
    if (!selectedTool) return
    setIsRunning(true)
    setError(null)
    try {
      const parsed = JSON.parse(toolInput)
      const tool = tools.find(t => t.name === selectedTool)
      const res = await tool?.execute(parsed)
      setResult(res)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">WebMCP Tools</h2>

      {/* Registration Status */}
      <div className="border rounded-lg p-4 mb-6 bg-card">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <p className="font-medium">WebMCP Tool Registration</p>
            <p className="text-sm text-gray-500">
              {registered
                ? '✅ All 6 tools registered in document.modelContext'
                : '⚠️ Click to register (if WebMCP is available)'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tool List */}
        <div className="space-y-3">
          <h3 className="font-semibold">Available Tools</h3>
          {tools.map((tool, idx) => (
            <div
              key={tool.name}
              onClick={() => {
                setSelectedTool(tool.name)
                setToolInput('{}')
                setResult(null)
                setError(null)
              }}
              className={`
                p-4 rounded-lg border cursor-pointer transition-colors
                ${selectedTool === tool.name ? 'border-primary bg-primary/5' : 'border-border hover:bg-gray-50'}
              `}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium">{tool.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {tool.description}
              </p>
            </div>
          ))}
        </div>

        {/* Test Tool */}
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="font-semibold mb-3">Test Tool</h3>
          {selectedTool ? (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Input JSON for <code className="text-primary">{selectedTool}</code>:
              </p>
              <textarea
                value={toolInput}
                onChange={e => setToolInput(e.target.value)}
                className="w-full p-3 rounded border border-border text-sm font-mono resize-none h-32 mb-3"
                placeholder={'{\n  "keywords": ["SaaS", "Founder"]\n}'}
              />
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="w-full py-2 rounded bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Execute Tool'}
              </button>
              {result && (
                <div className="mt-4 p-3 rounded bg-secondary/10 border border-secondary/20">
                  <p className="text-xs text-secondary font-medium mb-2">✅ Result:</p>
                  <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 rounded bg-error/10 border border-error/20">
                  <p className="text-xs text-error font-medium mb-2">❌ Error:</p>
                  <pre className="text-xs text-error">{error}</pre>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Select a tool on the left</p>
          )}
        </div>
      </div>
    </div>
  )
}