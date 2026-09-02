# AIScale.pro WebMCP SDR Demo

**A WebMCP-powered AI SDR platform demo** that showcases how agents and humans can collaborate to orchestrate outbound sales campaigns.

Built for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com/).

## The Concept

This demo demonstrates the future of AI-assisted sales workflows: **agents calling tools via WebMCP** to execute multi-step SDR campaigns while humans review/approve at key decision points.

### How It Works

1. **Agent** discovers leads via `search_leads`
2. **Agent** enriches each lead into a 360° dossier via `enrich_lead`
3. **Agent** scores and ranks leads via `score_lead`
4. **Human** reviews AI-generated email drafts
5. **Human** approves emails to send
6. **Agent** sends emails and creates follow-up sequences via `send_email` and `create_follow_up_sequence`

## WebMCP Tools Exposed

| Tool | Description |
|------|-------------|
| `search_leads` | Discover LinkedIn prospects matching criteria |
| `enrich_lead` | Build 360° dossier (company + person + tech stack) |
| `score_lead` | AI-score lead fit against ICP criteria |
| `generate_email` | Generate personalized cold email |
| `send_email` | Send via Resend (configurable to other providers) |
| `create_follow_up_sequence` | Set up automated follow-ups |
| `run_full_campaign` | One-click campaign execution |
| `get_campaign_analytics` | Real-time performance metrics |

## Why This Wins

- **WebMCP Leverage**: 8 tools registered, demonstrating full agent-orchestration capability
- **Execution**: Live dashboard, not a static demo
- **Potential Impact**: Solves real SDR pain point — automating pipeline while keeping human control
- **Creativity**: Inverts the model — agent orchestrates, human approves

## Quick Start

```bash
git clone https://github.com/aiscalepro/webmcp-sdr-demo
cd webmcp-sdr-demo
npm install
npm run dev
```

Open Chrome with `chrome://flags/#enable-webmcp-testing` or use ChatGPT's in-app browser, then navigate to `http://localhost:5173`.

## Deployment

Deploy to any provider:

```bash
npm run build
# Deploy dist/ to Vercel, Netlify, Cloudflare Pages, etc.
```

## Technology Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Backend**: Mock API (simulating AIScale.pro's real SDR orchestration engine)
- **Hosting**: Vercel (recommended for ChatGPT Sites compatibility)
- **WebMCP**: Enabled via standard model context registration pattern

## Demo Walkthrough

Watch the demo video for a step-by-step guide to the AI-agent orchestration flow.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*Built by AIScale.pro for the OpenAI WebMCP Challenge*