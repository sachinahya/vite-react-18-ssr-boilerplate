import { Writable } from 'stream';

import { v4 as uuid } from 'uuid';

import { StreamWriter } from './stream-writer.js';

export class NodeStreamWriter implements StreamWriter {
  #writable: Writable;
  #scriptKey: string;

  constructor(writable: Writable, scriptKey: string) {
    this.#writable = writable;
    this.#scriptKey = scriptKey;
  }

  write(chunk: unknown): void {
    this.#writable.write(chunk);
  }

  writeImmediateScript(content: string): void {
    const id = uuid().replaceAll('-', '');

    // Give each script element and
    const scriptId = `script_${this.#scriptKey}_${id}`;
    const scriptVarName = `${this.#scriptKey}_${id}`;

    const scriptContent = [
      `var ${scriptVarName} = document.createElement('script');`,
      `${scriptVarName}.innerHTML = ${JSON.stringify(content)};`,
      `document.body.appendChild(${scriptVarName});`,
      `document.getElementById("${scriptId}").remove();`,
    ].join('\n');

    this.#writable.write(`<script id="${scriptId}">${scriptContent}</script>`);
  }
}
