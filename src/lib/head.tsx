import { createContext, FC, ReactNode, useContext } from 'react';

export interface HeadState {
  title: string;
}

export class HeadStore {
  static readonly initialState: HeadState = { title: 'App' };

  #state: HeadState = HeadStore.initialState;

  setState(title: string): void {
    this.#state = {
      title,
    };
  }

  getState(): { title: string } {
    return this.#state;
  }
}

const HeadContext = createContext<HeadStore>(new HeadStore());

export const HeadProvider: FC<{ children?: ReactNode; store: HeadStore }> = ({
  children,
  store,
}) => {
  return <HeadContext.Provider value={store}>{children}</HeadContext.Provider>;
};

export const useHeadContext = (): HeadStore => {
  return useContext(HeadContext);
};
