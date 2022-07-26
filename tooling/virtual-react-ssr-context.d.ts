declare module 'virtual:react-ssr-context' {
  export type RawSsrManifest = Record<string, string[]>;

  export interface SsrContextType {
    readonly isStreaming: boolean;
    readonly modules: Set<string>;
    readonly emittedAssets: Set<string>;
    readonly manifest: RawSsrManifest;
  }

  export interface CreateSsrContextOptions {
    disableStreaming?: boolean;
    manifest?: RawSsrManifest;
  }

  export const createSsrContext: (options: CreateSsrContextOptions = {}) => SsrContextType;

  export interface SsrContextProviderProps {
    children?: ReactNode;
    context: SsrContextType;
  }

  export const SsrContextProvider: FC<SsrContextProviderProps>;
}
