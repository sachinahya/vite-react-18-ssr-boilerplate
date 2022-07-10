import { HeadStore } from '../../../lib/head';
import { StreamWriter } from '../writers/stream-writer';

import { StreamEnhancer } from './stream-enhancer';

export class HeadStreamEnhancer implements StreamEnhancer {
  scriptKey: string = 'head';

  #head: HeadStore;
  #lastTitle: string;

  constructor(head: HeadStore) {
    this.#head = head;
    this.#lastTitle = head.getState().title;
  }

  onBeforeWrite(writer: StreamWriter): void {
    const { title } = this.#head.getState();

    if (this.#lastTitle === title) {
      return;
    }

    const setTitleContent = `document.title = ${JSON.stringify(title)}`;
    writer.writeImmediateScript(setTitleContent);
  }
}
