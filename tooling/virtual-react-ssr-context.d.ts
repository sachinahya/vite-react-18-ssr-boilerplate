declare module 'virtual:react-ssr-context' {
  import { ComponentType, ReactNode } from 'react';

  export interface SsrContext {
    modules: Set<string>;
  }

  export interface SsrContextProviderProps {
    children?: ReactNode;
    context: SsrContext;
  }

  export const SsrContextProvider: ComponentType<SsrContextProviderProps>;

  export const createSsrContext: () => SsrContext;

  export const useRegisterSsrModule: (moduleId: string) => void;
}
