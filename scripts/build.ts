import path from 'path';

import { JSDOM } from 'jsdom';
import { build } from 'vite';

const extractStyles = (document: Pick<ParentNode, 'querySelectorAll'>): string[] =>
  [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href^="/assets"]')].map(
    (link) => link.href,
  );

const extractScripts = (document: Pick<ParentNode, 'querySelectorAll'>): string[] =>
  [...document.querySelectorAll<HTMLScriptElement>('script[src^="/assets"]')].map(
    (script) => script.src,
  );

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

const main = async () => {
  const clientResult = await build({
    build: {
      outDir: path.join(distDir, 'client'),
    },
  });

  const normalisedClientResult =
    'output' in clientResult ? [clientResult] : Array.isArray(clientResult) ? clientResult : [];

  if (normalisedClientResult.length !== 1 || !normalisedClientResult[0]) {
    throw new Error(
      `Unexpected client build result. Expected a single build output but got ${normalisedClientResult.length}.`,
    );
  }

  const [{ output }] = normalisedClientResult;

  const indexFile = output.find((item) => item.fileName === 'index.html');
  if (!indexFile || !('source' in indexFile)) {
    throw new Error('No index file found in the client build output.');
  }

  const ssrManifestFile = output.find((item) => item.fileName === 'ssr-manifest.json');
  if (
    !ssrManifestFile ||
    !('source' in ssrManifestFile) ||
    typeof ssrManifestFile.source !== 'string'
  ) {
    throw new Error('No SSR manifest found in the client build output.');
  }

  const dom = new JSDOM(indexFile.source);

  const assets = {
    scripts: extractScripts(dom.window.document),
    styles: extractStyles(dom.window.document),
    ssrManifest: JSON.parse(ssrManifestFile.source) as Record<string, string[]>,
  };

  await build({
    define: {
      __VITE_CLIENT_ASSETS__: assets,
    },
    build: {
      outDir: path.join(distDir, 'server'),
      ssr: path.join(rootDir, 'src', 'server', 'server-prod.ts'),
    },
  });
};

void main();
