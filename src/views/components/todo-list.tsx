import { FC, Suspense } from 'react';

import { Todo } from '../../components/todo';
import { useTodo } from '../../data/use-todo';

export const TodoList: FC = () => {
  const data = useTodo(2);

  return (
    <div>
      <pre>{JSON.stringify(data, undefined, 2)}</pre>
      <Suspense fallback={<div>Loading todo 2...</div>}>
        <Todo id={3} />
      </Suspense>
    </div>
  );
};
