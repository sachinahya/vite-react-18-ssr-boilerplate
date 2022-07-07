import { FC } from 'react';

import { useTodo } from '../data/use-todo';

export interface TodoProps {
  id: number;
}

export const Todo: FC<TodoProps> = ({ id }) => {
  const { data: todo, refetch } = useTodo(id);

  return (
    <div>
      <pre>{JSON.stringify(todo, undefined, 2)}</pre>
      <button onClick={() => void refetch()}>Test</button>
    </div>
  );
};
