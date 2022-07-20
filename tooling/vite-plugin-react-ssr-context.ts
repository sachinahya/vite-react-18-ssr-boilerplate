import path from 'node:path';

import stripIndent from 'strip-indent';
import { normalizePath, Plugin, PluginOption } from 'vite';

import { injectSsrModuleRegistration } from './inject-ssr-module-registration.js';

const virtualModulePlugin = (): Plugin => {
  const virtualModuleId = 'virtual:react-ssr-context';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    enforce: 'pre',
    name: 'react-ssr-context-virtual-module-plugin',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return stripIndent(`
          import { createElement, createContext, useContext, useCallback } from 'react';

          const SsrContext = createContext(() => {
            // Do nothing by default.
          });

          export const createSsrContext = () => {
            return {
              modules: new Set(),
            };
          };

          export const SsrContextProvider = ({ children, context }) => {
            const contextValue = useCallback((id) => {
              context.modules.add(id);
            }, [context]);
            return createElement(SsrContext.Provider, { children, value: contextValue })
          };

          export const useRegisterSsrModule = (moduleId) => {
            useContext(SsrContext)(moduleId);
          };
        `);
      }
    },
  };
};

const transformPlugin = (): Plugin => ({
  enforce: 'pre',
  name: 'react-ssr-context-transform-plugin',
  transform(this, code, id, options) {
    if (!options?.ssr) {
      return null;
    }

    const moduleId = normalizePath(path.relative(process.cwd(), id));
    const transformResult = injectSsrModuleRegistration({ code, moduleId });

    return {
      code: transformResult.code,
      map: transformResult.map,
    };
  },
});

export const reactSsrContext = (): PluginOption => [virtualModulePlugin(), transformPlugin()];
