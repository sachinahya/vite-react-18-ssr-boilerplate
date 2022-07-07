import { FC, Suspense } from 'react';

import { Todo } from '../components/todo';
import { useTodo } from '../data/use-todo';

const TodoList: FC = () => {
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

export const Home: FC = () => {
  return (
    <div>
      <h1>Home</h1>
      <button
        onClick={(event) => {
          console.log(event);
        }}
      >
        Test
      </button>
      <Suspense fallback={<div>Loading todo 1...</div>}>
        <TodoList />
      </Suspense>
    </div>
  );
};
