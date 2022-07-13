import { useAppQuery } from '../lib/query/use-app-query.js';

import { fetchTodo } from './fetch-todo.js';

export const useTodo = (id: number): { data: unknown; refetch: () => Promise<void> } => {
  const { result, refetch } = useAppQuery(['todo', id], () => fetchTodo(id));

  // @ts-expect-error -- Test.
  return { data: result, refetch };
};
