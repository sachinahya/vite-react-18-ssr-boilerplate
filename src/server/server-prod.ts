import '../lib/fetch-polyfill.js';

import path from 'path';
import { fileURLToPath } from 'url';

import { fastifyStatic } from '@fastify/static';
import { fastify } from 'fastify';
import isBot from 'isbot';

import { HeadContext } from '../lib/head/head-provider.js';

import { render } from './entry-server.js';
import { createStream, listen } from './fastify.js';
import { HeadStreamEnhancer } from './stream/enhancers/head-stream-enhancer.js';
import { ReactQueryStreamEnhancer } from './stream/enhancers/react-query-stream-enhancer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createServer = async (): Promise<void> => {
  const app = fastify();

  const distRoot = path.join(__dirname, '..');

  // Serve the client output as static assets.
  await app.register(fastifyStatic, {
    root: path.join(distRoot, 'client/assets'),
    prefix: '/assets',
  });

  // Obtain the script and style tags that Vite inserted into the html at build time.
  // The VITE_CLIENT_ASSETS variable will be replaced by the paths during the server build.
  const { scripts, styles } = __VITE_CLIENT_ASSETS__;

  app.all('*', async (request, reply) => {
    const isCrawler = isBot(request.headers['user-agent']);

    const headContext: HeadContext = {};
    const { jsx, queryClient } = await render({
      url: request.url,
      headContext,
      stylesheets: styles,
    });

    const stream = createStream(jsx, {
      useOnAllReady: true,
      entryScripts: scripts,
      enhancers: [new HeadStreamEnhancer(headContext), new ReactQueryStreamEnhancer(queryClient)],
      headContext,
    });

    return stream(reply);
  });

  await listen(app, 3000);
};

void createServer();
