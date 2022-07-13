import { FC } from 'react';
import { useQuery } from 'react-query';

import { delay } from '../lib/delay.js';

export const Picture: FC<{ id: string }> = ({ id }) => {
  const { data } = useQuery(['picture', id], async () => {
    await delay(Number.parseInt(id) * 2000);
    const res = await fetch('https://jsonplaceholder.typicode.com/todos/' + id);
    return res.json() as unknown;
  });

  return (
    <div>
      <pre>{JSON.stringify(data, undefined, 2)}</pre>
    </div>
  );
};
