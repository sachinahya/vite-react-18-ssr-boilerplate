import { ReactElement } from 'react';

import { hash } from './hash.js';

const getHashedScriptId = (content: string): string => `s_${hash(content).toString()}`;

const wrapContent = (scriptId: string, content: string): string =>
  `{${content}};document.getElementById('${scriptId}').remove();`;

export const wrapImmediateScript = (content: string): string => {
  const scriptId = getHashedScriptId(content);
  return `<script id="${scriptId}">${wrapContent(scriptId, content)}</script>`;
};

export const wrapImmediateScriptElement = (content: string): ReactElement => {
  const scriptId = getHashedScriptId(content);
  return <script id={scriptId}>{wrapContent(scriptId, content)}</script>;
};
