export const extractStyles = (document: Pick<ParentNode, 'querySelectorAll'>): string[] =>
  [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href^="/assets"]')].map(
    (link) => link.href,
  );

export const extractScripts = (document: Pick<ParentNode, 'querySelectorAll'>): string[] =>
  [...document.querySelectorAll<HTMLScriptElement>('script[src^="/assets"]')].map(
    (script) => script.src,
  );
