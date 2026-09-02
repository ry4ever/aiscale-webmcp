module.exports = {
  plugins: [
    {
      name: 'configure-react',
      config: () => {
        return {
          optimizeDeps: {
            include: ['react', 'react-dom', 'lucide-react'],
          },
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  server: {
    port: 5173,
  },
}