import { ServerResponse } from 'http';
import { Writable } from 'stream';

import chalk from 'chalk';
import { FastifyInstance, FastifyReply } from 'fastify';
import { ReactNode } from 'react';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';

import { ReactStreamWriter } from './react-stream-writer';
import { StreamEnhancer } from './stream/stream-enhancer';

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
  const { entryScripts, useOnAllReady, devTemplate, enhancers } = options;

  const reactRenderMethodName: keyof RenderToPipeableStreamOptions = useOnAllReady
    ? 'onAllReady'
    : 'onShellReady';

  return (reply) => {
    let didError = false;

    const pipeableStream = renderToPipeableStream(jsx, {
      bootstrapModules: entryScripts,
      [reactRenderMethodName]() {
        setHeaders(reply.raw, didError);

        // Use a stream enhancers if we are streaming to inject stuff into the stream.
        const writableStream =
          !useOnAllReady && enhancers ? new ReactStreamWriter(reply.raw, enhancers) : reply.raw;

        // Send the HTML.
        const pipedStream: Writable = pipeableStream.pipe(writableStream);

        if (devTemplate) {
          reply.raw.write(devTemplate);
        }

        pipedStream.once('finish', () => {
          // Normally React calls .end on the writable by itself.
          // But since we have a wrapper around the writable we cannot be sure that the wrapper
          // correctly implements all needed methods.
          // So we will call .end manually if the writable has not been ended yet.
          if (!reply.raw.writableEnded) {
            reply.raw.end();
          }
        });
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
