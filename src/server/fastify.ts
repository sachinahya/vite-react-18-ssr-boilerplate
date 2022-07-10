import { ServerResponse } from 'http';
import { Writable } from 'stream';

import chalk from 'chalk';
import { FastifyInstance, FastifyReply } from 'fastify';
import { ReactNode } from 'react';
import {
  PipeableStream,
  renderToPipeableStream,
  RenderToPipeableStreamOptions,
} from 'react-dom/server';

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

const setHeaders = (response: ServerResponse, didError: boolean) => {
  // If something errored before we started streaming, we set the error code appropriately.
  response.statusCode = didError ? 500 : 200;

  if (!response.headersSent) {
    response.setHeader('Content-Type', 'text/html');
  }
};

class ReactStreamEnhancer extends Writable {
  constructor(private _writable: Writable) {
    super();
  }

  override _write(
    chunk: unknown,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void,
  ): void {
    if (this._writable.destroyed) {
      return;
    }

    this._writable.write(chunk, encoding, callback);
  }

  public flush() {
    const flushableStream = this._writable as typeof this._writable & { flush: unknown };

    if (typeof flushableStream.flush === 'function') {
      flushableStream.flush();
    }
  }
}

export const createStream = <TBefore>(
  jsx: ReactNode,
  options: CreateStreamOptions<TBefore>,
): ((reply: FastifyReply) => FastifyReply) => {
  const { entryScripts, useOnAllReady, onBeforePipe, onAfterPipe } = options;

  const reactRenderMethodName: keyof RenderToPipeableStreamOptions = useOnAllReady
    ? 'onAllReady'
    : 'onShellReady';

  return (reply) => {
    let didError = false;

    const pipeableStream = renderToPipeableStream(jsx, {
      bootstrapModules: entryScripts,
      [reactRenderMethodName]() {
        setHeaders(reply.raw, didError);

        const state = onBeforePipe?.();

        const proxy = new ReactStreamEnhancer(reply.raw);

        // Send the HTML.
        const stream: Writable = pipeableStream.pipe(proxy);

        if (state) {
          onAfterPipe?.(state, reply.raw);
        }

        stream.once('finish', () => {
          /**
           * Actually, it is not necessary to call res.end manually,
           * cause React does this by itself
           *
           * But, if we have any wrapper on res, we can not be sure,
           * that wrapper implements all needed methods (especially _final)
           * So, the `end` method will be called manually, if writable has not been ended yet.
           */
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
