import { HeadContext } from '../../../lib/head/head-provider.js';
import { StreamWriter } from '../writers/stream-writer.js';

import { StreamEnhancer } from './stream-enhancer.js';

export class HeadStreamEnhancer implements StreamEnhancer {
  scriptKey: string = 'head';

  #head: HeadContext;

  constructor(head: HeadContext) {
    this.#head = head;
  }

  onBeforeWrite(writer: StreamWriter): void {
    // if (this.#lastTitle !== title) {
    //   const setTitleContent = `document.title = ${JSON.stringify(title)}`;
    //   this.#lastTitle = title;
    //   writer.writeImmediateScript(setTitleContent);
    // }
    // Vite's preload helper injects CSS files for us.
    // Maybe you would need to do this for runtime CSS-in-JS like styled-components, emotion, etc.
    // const newStylesheets = this.#head.flushStylesheets();
    // if (newStylesheets.length > 0) {
    //   const content = newStylesheets
    //     .map((href) => `<link rel="stylesheet" href="${href}" />`)
    //     .join('');
    //   writer.write(content);
    // }
  }
}
