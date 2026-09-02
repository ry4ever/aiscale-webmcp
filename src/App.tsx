import { useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { WebMCPToolPanel } from './components/WebMCPToolPanel'
import { LeadPipeline } from './components/LeadPipeline'
import { CampaignView } from './components/CampaignView'
import { LiveActivityLog } from './components/LiveActivityLog'
import { Search, Users, Send, BarChart3, Activity, Bot, Zap, Shield } from 'lucide-react'

type View = 'dashboard' | 'pipeline' | 'campaigns' | 'tools' | 'activity'

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'pipeline', label: 'Lead Pipeline', icon: Users },
  { id: 'campaigns', label: 'Campaigns', icon: Send },
  { id: 'tools', label: 'WebMCP Tools', icon: Zap },
  { id: 'activity', label: 'Agent Activity', icon: Activity },
] as const

export function App() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 bg-card border-r border-border flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">AIScale.pro</h1>
                <p className="text-xs text-gray-500">WebMCP SDR Demo</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeView === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-700"
          >
            <Shield className="w-4 h-4" />
            {sidebarOpen && <span>WebMCP Enabled</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'pipeline' && <LeadPipeline />}
          {activeView === 'campaigns' && <CampaignView />}
          {activeView === 'tools' && <WebMCPToolPanel />}
          {activeView === 'activity' && <LiveActivityLog />}
        </div>
      </main>
    </div>
  )
}