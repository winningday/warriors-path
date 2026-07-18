import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Treat .jsx as JSX. The single-file artifact lives at warriors-path.jsx and is
// imported by index.html → src/main.jsx → ../warriors-path.jsx.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Dev-only: forwards sync/tutor API calls to a locally running
    // `node server/server.js` (see server/README.md).
    proxy: { '/api': 'http://localhost:8787' },
  },
});
