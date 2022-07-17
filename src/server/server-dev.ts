import '../lib/fetch-polyfill.js';

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import fastifyExpress from '@fastify/express';
import detectPort from 'detect-port';
import { fastify } from 'fastify';
import { JSDOM } from 'jsdom';
import { ReactNode } from 'react';
import { QueryClient } from 'react-query';
import { createServer as createViteServer } from 'vite';

import { HeadContext } from '../lib/head/head-provider.js';
import { ReactQueryStreamEnhancer } from '../lib/query/hydration.js';

import { createStream, listen } from './fastify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createServer = async (): Promise<void> => {
  const app = fastify({ logger: false });
  await app.register(fastifyExpress);

  // Create Vite server in middleware mode. This disables Vite's own HTML serving logic and let
  // the parent server take control.
  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' },
  });

  // Use vite's connect instance as middleware.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Don't know why this is an error.
  app.use(vite.middlewares);

  // Add our client entry script as a bootstrap module.
  // This will be intercepted by Vite's dev server when requested by the browser.
  // We can extract the file name by parsing the index.html file.
  const indexHtml = await readFile(path.join(__dirname, '../../index.html'));
  const dom = new JSDOM(indexHtml);
  const scriptElements = dom.window.document.querySelectorAll<HTMLScriptElement>('script');
  const scripts = [...scriptElements].map((script) => script.src.replace(/^\./, ''));

  app.get('/favicon.ico', (request, reply) => {
    return reply.code(404).send();
  });

  app.all('*', async (request, reply) => {
    const { url } = request;
    console.log('----------------------------------------');
    console.log(url);
    console.log('----------------------------------------');

    const { render } = (await vite.ssrLoadModule(
      path.join(__dirname, './entry-server.tsx'),
    )) as typeof import('./entry-server.js');

    // This obtains the code for the Vite HMR client, and also applies HTML transforms from Vite
    // plugins, e.g.global preambles from @vitejs/plugin-react
    const devTemplate = await vite.transformIndexHtml(url, '');

    // Make it async so it doesn't defer. This allows it to usually load before the client entry
    // though is potentially subject to race conditions.
    const asyncDevTemplate = devTemplate.replaceAll('type="module"', 'type="module" async=""');

    let jsx: ReactNode = null;
    let queryClient: QueryClient;
    const headContext: HeadContext = {};

    try {
      ({ jsx, queryClient } = await render({
        url,
        headContext,
      }));
    } catch (error) {
      if (error instanceof Error) {
        // If an error is caught, let Vite fix the stacktrace so it maps back to your actual
        // source code.
        vite.ssrFixStacktrace(error);
      }

      throw error;
    }

    const stream = createStream(jsx, {
      useOnAllReady: false,
      entryScripts: scripts,
      devTemplate: asyncDevTemplate,
      enhancers: [new ReactQueryStreamEnhancer(queryClient)],
      headContext,
    });

    return stream(reply);
  });

  const preferredPort = 3000;
  const availablePort = await detectPort(preferredPort);

  if (preferredPort !== availablePort) {
    // eslint-disable-next-line no-console -- Development only.
    console.log(`Port ${preferredPort} is already in use, trying port ${availablePort}...`);
  }

  await listen(app, availablePort);
};

void createServer();
