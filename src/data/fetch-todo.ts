import { delay } from '../lib/delay';

export const fetchTodo = async (id: number): Promise<unknown> => {
  console.log('Fetching todo ' + id);
  console.time('Todo ' + id);
  await delay(id * 2000);
  const res = await fetch('https://jsonplaceholder.typicode.com/todos/' + id.toString());
  console.timeEnd('Todo ' + id);
  return res.json() as unknown;
};
