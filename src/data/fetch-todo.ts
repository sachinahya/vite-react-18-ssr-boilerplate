import { delay } from '../lib/delay';

export const fetchTodo = async (id: number): Promise<unknown> => {
  console.log('Fetching todo ' + id.toString());
  console.time('Todo ' + id.toString());
  await delay(id * 100);
  const res = await fetch('https://jsonplaceholder.typicode.com/todos/' + id.toString());
  console.timeEnd('Todo ' + id.toString());
  return res.json() as unknown;
};
