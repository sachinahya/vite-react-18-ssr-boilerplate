import path from 'path';

import fastifyStatic from '@fastify/static';
import fastify from 'fastify';

import { render } from './entry-server';
import { createStream, listen } from './fastify';
import { dehydrateQueryClient, writeDehydratedState } from './hydrate-query-client';

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
    // const isCrawler = isBot(headers['user-agent']);

    const { jsx, queryClient } = await render({ url: request.url, styles });

    const stream = createStream(jsx, {
      entryScripts: scripts,
      useOnAllReady: true,
      onBeforePipe: dehydrateQueryClient(queryClient),
      onAfterPipe: writeDehydratedState,
    });

    return stream(reply);
  });

  await listen(app, 3000);
};

void createServer();
