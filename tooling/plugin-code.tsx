import path from 'node:path';

import React, {
  createContext,
  FC,
  forwardRef,
  Fragment,
  ReactElement,
  RefAttributes,
  useContext,
} from 'react';
import type {
  SsrContextType,
  CreateSsrContextOptions,
  SsrContextProviderProps,
} from 'virtual:react-ssr-context';

/* eslint-disable no-fallthrough, unicorn/prefer-code-point, unicorn/numeric-separators-style -- Not my code. */

/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param key ASCII only
 * @param seed Positive integer only
 * @return 32-bit positive integer hash
 */

export const hash = (key: string, seed: number = 0): number => {
  const remainder = key.length & 3; // key.length % 4
  const bytes = key.length - remainder;
  let h1 = seed;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let k1;
  let h1b;
  let i = 0;

  while (i < bytes) {
    k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(++i) & 0xff) << 8) |
      ((key.charCodeAt(++i) & 0xff) << 16) |
      ((key.charCodeAt(++i) & 0xff) << 24);
    ++i;

    k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
  }

  k1 = 0;

  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      k1 ^= key.charCodeAt(i) & 0xff;

      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= k1;
  }

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
};

/* eslint-enable no-fallthrough, unicorn/prefer-code-point, unicorn/numeric-separators-style -- Not my code. */

const getHashedScriptId = (content: string): string => `s_${hash(content).toString()}`;

const wrapContent = (scriptId: string, content: string): string =>
  `{${content}};document.getElementById('${scriptId}').remove();`;

export const wrapImmediateScriptElement = (content: string): ReactElement => {
  const scriptId = getHashedScriptId(content);
  return <script id={scriptId}>{wrapContent(scriptId, content)}</script>;
};

export const createSsrContext = (options: CreateSsrContextOptions = {}): SsrContextType => {
  return {
    isStreaming: !options.disableStreaming,
    modules: new Set(),
    emittedAssets: new Set(),
    manifest: options.manifest ?? {},
  };
};

const SsrContext = createContext<SsrContextType>(createSsrContext());

export const SsrContextProvider: FC<SsrContextProviderProps> = ({ children, context }) => {
  // eslint-disable-next-line react/no-children-prop -- Test
  return <SsrContext.Provider value={context}>{children}</SsrContext.Provider>;
};

export const withSsrContext =
  (moduleId: string) =>
  (Component: FC): FC => {
    const InnerComponent = forwardRef<unknown, RefAttributes<unknown>>((props, ref) => {
      const originalElement = <Component ref={ref} {...props} />;

      const context = useContext(SsrContext);

      if (context.modules.has(moduleId)) {
        // We've already processed this module.
        return originalElement;
      }
      context.modules.add(moduleId);

      const assets = context.manifest[moduleId];

      if (!assets || assets.length === 0) {
        return originalElement;
      }

      const prependedElements = [];
      for (const dep of assets) {
        if (context.emittedAssets.has(dep)) {
          // Already emitted this asset, don't emit it again.
          continue;
        }
        context.emittedAssets.add(dep);

        if (path.extname(dep) === '.js') {
          const id = path.basename(dep, '.js');
          const linkId = 'l_' + id;

          // Script to insert a modulepreload directive for this component's script chunk.
          // Allows the browser to start downloading the module before Vite dynamically imports it
          // during hydration.
          prependedElements.push(
            wrapImmediateScriptElement(
              `const l = document.createElement('link');` +
                `l.id = '${linkId}';` +
                `l.rel = 'modulepreload';` +
                `l.crossOrigin = '';` +
                `l.href = '${dep}';` +
                `document.head.appendChild(l);`,
            ),
          );
        }

        if (path.extname(dep) === '.css') {
          // Emits CSS link tags close to the components that depend on them to support streaming.
          // Note that this helps even when not using streaming SSR because the browser can still
          // stream the full HTML response and render whatever content before the link tag.
          const id = path.basename(dep, '.css');
          const linkId = 'l_' + id;

          prependedElements.push(
            // Emit a link tag for each CSS file that needs to be loaded, placing it before the
            // component's HTML. This blocks rendering of the component's HTML until the CSS has
            // downloaded and parsed so that we don't get FOUC.
            <link rel="stylesheet" id={linkId} href={dep} />,
            // Emit a script tag after the link tag and before the component's HTML that moves the
            // link tag outside of the React tree to prevent hydration mismatch. The script tag then
            // removes itself to prevent hydration mismatch.
            wrapImmediateScriptElement(
              `document.head.appendChild(document.getElementById('${linkId}'));`,
            ),
          );
        }
      }

      // eslint-disable-next-line import/no-named-as-default-member -- Needs to have React namespace to transform correctly.
      return /* @__PURE__ */ React.createElement(
        Fragment,
        null,
        ...prependedElements,
        originalElement,
      );
    });

    InnerComponent.displayName = Component.displayName || Component.name;
    return InnerComponent;
  };
