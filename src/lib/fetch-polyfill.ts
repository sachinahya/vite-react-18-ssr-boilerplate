import * as fetchNode from 'cross-fetch';

const fetch = fetchNode.fetch.bind({});

// @ts-expect-error -- Test.
fetch.polyfill = true;

if (!global.fetch) {
  global.fetch = fetch;
  global.Response = fetchNode.Response;
  global.Headers = fetchNode.Headers;
  global.Request = fetchNode.Request;
}
