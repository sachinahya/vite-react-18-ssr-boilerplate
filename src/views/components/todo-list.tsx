import { FC, Suspense } from 'react';

import { Head } from '../../components/head';
import { Todo } from '../../components/todo';
import { useTodo } from '../../data/use-todo';

import * as styles from './todo-list.css';

export const TodoList: FC = () => {
  const data = useTodo(2);

  return (
    <div>
      <Head>
        <title>Todo List</title>
      </Head>
      <pre className={styles.pre}>{JSON.stringify(data, undefined, 2)}</pre>
      <Suspense fallback={<div>Loading todo 2...</div>}>
        <Todo id={3} />
      </Suspense>
    </div>
  );
};
