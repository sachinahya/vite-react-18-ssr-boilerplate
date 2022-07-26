import { FC, lazy, Suspense } from 'react';

import { Head } from '../../components/head.js';
import { useTodo } from '../../data/use-todo.js';

import * as styles from './todo-list.css.js';

const Todo = lazy(() => import('../../components/todo.js').then((mod) => ({ default: mod.Todo })));

export const TodoList: FC = () => {
  const data = useTodo(2);

  return (
    <div>
      <Head>
        <title>Todo List</title>
      </Head>
      <pre className={styles.pre} style={{ whiteSpace: 'normal' }}>
        {JSON.stringify(data, undefined, 2)}
      </pre>
      <Suspense fallback={<div>Loading todo 2...</div>}>
        <Todo id={3} />
      </Suspense>
    </div>
  );
};
