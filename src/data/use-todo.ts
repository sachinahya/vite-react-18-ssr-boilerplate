import { useQuery } from 'react-query';

import { fetchTodo } from './fetch-todo';

export const useTodo = (id: number): { data: unknown; refetch: () => Promise<void> } => {
  const { data, refetch } = useQuery(['todo', id], () => fetchTodo(id));

  // @ts-expect-error -- Test.
  return { data, refetch };
};
