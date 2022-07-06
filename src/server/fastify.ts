import chalk from 'chalk';
import { FastifyInstance, FastifyReply } from 'fastify';
import { ReactNode } from 'react';
import { PipeableStream, renderToPipeableStream } from 'react-dom/server';

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

export interface CreateStreamOptions<TBefore> {
  entryScripts?: string[];
  useOnAllReady?: boolean;
  onBeforePipe?: () => TBefore;
  onAfterPipe?: (data: TBefore, writable: NodeJS.WritableStream) => void;
}

const DOCTYPE = '<!doctype html>';

const setHeaders = (reply: FastifyReply, didError: boolean) => {
  // If something errored before we started streaming, we set the error code appropriately.
  reply.raw.statusCode = didError ? 500 : 200;

  if (!reply.raw.headersSent) {
    reply.raw.setHeader('Content-Type', 'text/html');
  }
};

export const createStream = <TBefore>(
  jsx: ReactNode,
  options: CreateStreamOptions<TBefore>,
): ((reply: FastifyReply) => FastifyReply) => {
  const { entryScripts, useOnAllReady, onBeforePipe, onAfterPipe } = options;

  return (reply) => {
    let didError = false;

    const onReady = (stream: PipeableStream) => {
      setHeaders(reply, didError);

      const state = onBeforePipe?.();

      // Send the HTML.
      stream.pipe(reply.raw);

      if (state) {
        onAfterPipe?.(state, reply.raw);
      }
    };

    const stream = renderToPipeableStream(jsx, {
      bootstrapModules: entryScripts,
      onShellReady: () => {
        // The content above all Suspense boundaries is ready.

        if (!useOnAllReady) {
          onReady(stream);
        }
      },
      onShellError: () => {
        // Something errored before we could complete the shell so we emit an alternative shell.
        void reply.status(500).send(`${DOCTYPE}<p>Error in SSR!</p>`);
      },
      onAllReady: () => {
        // If you don't want streaming, use this instead of onShellReady.
        // This will fire after the entire page content is ready.
        // You can use this for crawlers or static generation.

        if (useOnAllReady) {
          onReady(stream);
        }
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
