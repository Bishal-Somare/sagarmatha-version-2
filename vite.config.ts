import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-mock-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const parsedUrl = (req.url || '').split('?')[0];

            if (parsedUrl === '/api/config') {
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  classes: {
                    Montessori: ['Rose', 'Lotus'],
                    PG: ['A', 'B'],
                    Nursery: ['A', 'B'],
                    LKG: ['A', 'B'],
                    UKG: ['A', 'B'],
                    '1': ['A', 'B'],
                    '2': ['A', 'B'],
                    '3': ['A', 'B'],
                    '4': ['A', 'B'],
                    '5': ['A', 'B'],
                    '6': ['A', 'B'],
                    '7': ['A', 'B'],
                    '8': ['A', 'B'],
                    '9': ['A', 'B'],
                    '10': ['A', 'B'],
                  },
                }),
              );
              return;
            }

            if (parsedUrl === '/api/auth' && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body || '{}');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      sessionToken: 'demo-token-' + Date.now(),
                      className: data.className || '1',
                      section: data.section || 'A',
                      expiresIn: 86400,
                    }),
                  );
                } catch {
                  res.statusCode = 400;
                  res.end(JSON.stringify({success: false, error: 'Invalid payload'}));
                }
              });
              return;
            }

            if (parsedUrl === '/api/submit' && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    recordId: 'HV-' + Math.floor(100000 + Math.random() * 900000),
                  }),
                );
              });
              return;
            }

            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
