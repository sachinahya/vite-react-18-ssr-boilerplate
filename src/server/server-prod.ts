import '../lib/fetch-polyfill.js';

import path from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line import/no-named-as-default -- Types are wrong, doesn't have a named export.
import fastifyStatic from '@fastify/static';
import { fastify } from 'fastify';
import isBot from 'isbot';

import { ReactQueryStreamEnhancer } from '../lib/query/hydration.js';

import { render } from './entry-server.js';
import { createStream, listen } from './fastify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createServer = async (): Promise<void> => {
  const app = fastify();

  const distRoot = path.join(__dirname, '..');

  // Serve the client output as static assets.
  // @ts-expect-error -- They do not define types for their CJS export correctly.
  await app.register(fastifyStatic, {
    root: path.join(distRoot, 'client/assets'),
    prefix: '/assets',
  });

  // Obtain the script and style tags that Vite inserted into the html at build time.
  // The VITE_CLIENT_ASSETS variable will be replaced by the paths during the server build.
  const { scripts, styles } = __VITE_CLIENT_ASSETS__;

  app.all('*', async (request, reply) => {
    if (request.url === '/favicon.ico') {
      return reply.status(404).send();
    }

    const isCrawler = isBot(request.headers['user-agent']);

    const result = await render({ url: request.url });

    const stream = createStream(result.jsx, {
      useOnAllReady: isCrawler,
      entryScripts: scripts,
      enhancers: [new ReactQueryStreamEnhancer(result.queryClient)],
      headContext: result.headContext,
      stylesheets: styles,
    });

    return stream(reply);
  });

  await listen(app, 3000);
};

void createServer();
