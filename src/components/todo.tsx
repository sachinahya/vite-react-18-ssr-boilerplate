import { FC } from 'react';

import { useTodo } from '../data/use-todo.js';

import * as styles from './todo.css.js';

export interface TodoProps {
  id: number;
}

export const Todo: FC<TodoProps> = ({ id }) => {
  const { data: todo, refetch } = useTodo(id);

  return (
    <div>
      <pre className={styles.pre}>{JSON.stringify(todo, undefined, 2)}</pre>
      <button onClick={() => void refetch()}>Test</button>
    </div>
  );
};
