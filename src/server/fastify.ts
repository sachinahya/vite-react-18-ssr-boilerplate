import { ServerResponse } from 'http';
import { Writable } from 'stream';

import chalk from 'chalk';
import { FastifyInstance, FastifyReply } from 'fastify';
import { ReactNode } from 'react';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';

import { APP_CONTAINER_ID } from '../constants.js';
import { getInitialSsrHead } from '../lib/head/get-initial-ssr-head.js';
import { HeadContext } from '../lib/head/head-provider.js';

import { StreamEnhancer } from './stream/enhancers/stream-enhancer.js';
import { IntermediateSsrStream } from './stream/intermediate-ssr-stream.js';

export const listen = async (app: FastifyInstance, port: number): Promise<void> => {
  try {
    await app.listen({ port });
    // eslint-disable-next-line no-console -- Development only.
    console.log(chalk.green(`🚀 Open for business on port ${port}.`));
  } catch (error) {
    app.log.error(error);
    throw error;
  }
};

export interface CreateStreamOptions {
  headContext: HeadContext;
  entryScripts?: string[];
  useOnAllReady?: boolean;
  devTemplate?: string;
  enhancers?: StreamEnhancer[];
}

const DOCTYPE = '<!doctype html>';

const setHeaders = (response: ServerResponse, didError: boolean) => {
  // If something errored before we started streaming, we set the error code appropriately.
  response.statusCode = didError ? 500 : 200;

  if (!response.headersSent) {
    response.setHeader('Content-Type', 'text/html');
  }
};

export const createStream = (
  jsx: ReactNode,
  options: CreateStreamOptions,
): ((reply: FastifyReply) => FastifyReply) => {
  const { headContext, entryScripts, useOnAllReady, devTemplate, enhancers } = options;

  const reactRenderMethodName: keyof RenderToPipeableStreamOptions = useOnAllReady
    ? 'onAllReady'
    : 'onShellReady';

  return (reply) => {
    let didError = false;

    // Start writing what we can before React starts rendering.
    reply.raw.write(`<!doctype html><html><head>`);

    const pipeableStream = renderToPipeableStream(jsx, {
      bootstrapModules: entryScripts,
      [reactRenderMethodName]() {
        setHeaders(reply.raw, didError);

        // Add the head content, grabbing whatever context we can from the app render.
        const headHtml = getInitialSsrHead(headContext);
        reply.raw.write(`${headHtml}</head><body><div id="${APP_CONTAINER_ID}">`);

        const useReactStreamWriter = !useOnAllReady && enhancers;

        // Use a stream enhancers if we are streaming to inject stuff into the stream.
        const writableStream = useReactStreamWriter
          ? new IntermediateSsrStream(reply.raw, enhancers)
          : reply.raw;

        // Send the HTML.
        const pipedStream: Writable = pipeableStream.pipe(writableStream);

        // Close off the document.
        reply.raw.write(`</div>${devTemplate || ''}</body></html>`);

        if (useReactStreamWriter) {
          pipedStream.once('finish', () => {
            // Normally React calls .end on the writable by itself.
            // But since we have a wrapper around the writable we cannot be sure that the wrapper
            // correctly implements all needed methods.
            // So we will call .end manually if the writable has not been ended yet.
            if (!reply.raw.writableEnded) {
              reply.raw.end();
            }
          });
        }
      },
      onShellError: () => {
        // Something errored before we could complete the shell so we emit an alternative shell.
        void reply.status(500).send(`${DOCTYPE}<p>Error in SSR!</p>`);
      },
      onError: (error) => {
        didError = true;
        // eslint-disable-next-line no-console -- Would be replaced by a proper logger.
        console.error(error);
      },
    });

    return reply;
  };
};
