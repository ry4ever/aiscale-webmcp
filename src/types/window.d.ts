// Type declarations for WebMCP API
// See: https://github.com/webmachinelearning/webmcp

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: {
        name: string
        description: string
        inputSchema: object
        execute: (input: any) => Promise<any> | any
      }) => void
      getTools?: () => any[]
    }
  }

  interface Window {
    webmcpTools: any[]
  }
}

export {}
