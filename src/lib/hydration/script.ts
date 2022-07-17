import { v4 as uuid } from 'uuid';

export const wrapImmediateScript = (key: string, content: string): string => {
  const chunkId = uuid().replaceAll('-', '');

  const scriptId = `data_${key}_${chunkId}`;
  const scriptVarName = `${key}_${chunkId}`;

  return [
    `<script id="${scriptId}">`,
    `var ${scriptVarName} = document.createElement('script');`,
    `${scriptVarName}.innerHTML = ${JSON.stringify(content)};`,
    `document.body.appendChild(${scriptVarName});`,
    `document.getElementById('${scriptId}').remove();`,
    '</script>',
  ].join('\n');
};
