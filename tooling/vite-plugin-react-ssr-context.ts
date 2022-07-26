import { readFileSync } from 'node:fs';
import path from 'node:path';

import { normalizePath, Plugin, PluginOption, transformWithEsbuild } from 'vite';

import { injectSsrContext } from './babel-transform.js';

const virtualModulePlugin = (): Plugin => {
  const virtualModuleId = 'virtual:react-ssr-context';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  const rawPluginCode = readFileSync('./tooling/plugin-code.tsx', 'utf8');

  return {
    enforce: 'pre',
    name: 'react-ssr-context-virtual-module-plugin',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const pluginCode = await transformWithEsbuild(rawPluginCode, 'plugin-code.tsx');
        return pluginCode;
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
    const transformResult = injectSsrContext({ code, moduleId });

    return {
      code: transformResult.code,
      map: transformResult.map,
    };
  },
});

export const reactSsrContext = (): PluginOption => [virtualModulePlugin(), transformPlugin()];
