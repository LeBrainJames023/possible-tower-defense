import { createServer } from 'vite';

const server = await createServer({
  root: '/Users/participant/Desktop/possible-tower-defense',
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
});
await server.ssrLoadModule('/tools/simCampaign.ts');
await server.close();
